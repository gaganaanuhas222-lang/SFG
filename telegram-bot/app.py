import os
import json
import logging
import requests
import tempfile
import re
from io import BytesIO
from collections import deque
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from duckduckgo_search import DDGS

# ----- Firebase (optional) -----
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logging.warning("Firebase Admin not installed. History will not persist.")

# ----- PDF Libraries -----
try:
    import PyPDF2
    PDF_READ_SUPPORT = True
except ImportError:
    PDF_READ_SUPPORT = False

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER
    from reportlab.lib.colors import black, grey, navy, blue, lightgrey, white
    from reportlab.pdfgen import canvas
    from reportlab.graphics.shapes import Drawing, Rect, Line, String, Polygon
    PDF_WRITE_SUPPORT = True
except ImportError:
    PDF_WRITE_SUPPORT = False

# ----- CONFIGURATION -----
TELEGRAM_TOKEN = "8793608790:AAGwcZeIektGBScIz1C_u6OS8FgPNmqCpwQ"
GROQ_API_KEY = "ur api"

GROQ_API_KEY = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", TELEGRAM_TOKEN)

if not TELEGRAM_TOKEN or not GROQ_API_KEY:
    raise ValueError("Missing TELEGRAM_TOKEN or GROQ_API_KEY")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"
MAX_SEARCH_RESULTS = 5
MAX_PDF_PAGES = 20
MAX_PDF_TEXT_LEN = 15000
MAX_HISTORY = 10
MAX_RESPONSE_TOKENS = 1500
MAX_MESSAGE_LEN = 4000

# In-memory store (will be loaded from Firestore if available)
user_data = {}

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ------------------ Firebase Initialization ------------------
db = None
if FIREBASE_AVAILABLE:
    try:
        # Check if credentials are provided as env var JSON or file path
        cred_json = os.getenv("FIREBASE_CREDENTIALS")
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
        if cred_json:
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
        elif os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            cred = None
            logger.warning("Firebase credentials not found. Disabling persistence.")

        if cred:
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            logger.info("Firebase Firestore initialized.")
    except Exception as e:
        logger.exception("Failed to initialize Firebase")
        db = None

# ------------------ Firestore Persistence Functions ------------------
def load_all_user_data():
    """Load all user data from Firestore into user_data dict."""
    if db is None:
        return
    try:
        docs = db.collection("chat_history").stream()
        for doc in docs:
            uid = doc.id
            data = doc.to_dict()
            # Reconstruct deque for chat_history
            history = data.get("chat_history", [])
            if history:
                # Firestore stores list; convert to deque
                data["chat_history"] = deque(history, maxlen=MAX_HISTORY)
            else:
                data["chat_history"] = deque(maxlen=MAX_HISTORY)
            user_data[uid] = data
        logger.info(f"Loaded {len(user_data)} user records from Firestore.")
    except Exception as e:
        logger.exception("Failed to load data from Firestore")

def save_user_data(user_id: str):
    """Save a single user's data to Firestore."""
    if db is None:
        return
    try:
        data = user_data.get(user_id, {})
        # Convert deque to list for Firestore
        data_to_save = data.copy()
        if "chat_history" in data_to_save:
            data_to_save["chat_history"] = list(data_to_save["chat_history"])
        db.collection("chat_history").document(user_id).set(data_to_save)
    except Exception as e:
        logger.exception(f"Failed to save data for user {user_id}")

# Load all data on startup
load_all_user_data()

# ------------------ PDF Extraction ------------------
def extract_pdf_text(pdf_path: str) -> str:
    if not PDF_READ_SUPPORT:
        return ""
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text_parts = []
            for i, page in enumerate(reader.pages):
                if i >= MAX_PDF_PAGES:
                    break
                text = page.extract_text()
                if text.strip():
                    text_parts.append(text.strip())
            full_text = "\n".join(text_parts)
            if len(full_text) > MAX_PDF_TEXT_LEN:
                full_text = full_text[:MAX_PDF_TEXT_LEN] + "... (truncated)"
            return full_text
    except Exception as e:
        logger.exception("PDF extraction failed")
        return ""

# ------------------ PDF Generation (unchanged) ------------------
def generate_pdf(text: str, title: str = "Document") -> BytesIO:
    if not PDF_WRITE_SUPPORT:
        raise RuntimeError("ReportLab not installed.")
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=25*mm,
        bottomMargin=22*mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle', parent=styles['Heading1'], fontSize=24, leading=28,
        alignment=TA_CENTER, textColor=navy, spaceAfter=12
    )
    subtitle_style = ParagraphStyle(
        'SubtitleStyle', parent=styles['Normal'], fontSize=16,
        alignment=TA_CENTER, textColor=grey, spaceAfter=20
    )
    heading_style = ParagraphStyle(
        'HeadingStyle', parent=styles['Heading2'], fontSize=16, leading=20,
        alignment=TA_LEFT, textColor=blue, spaceAfter=8, spaceBefore=10
    )
    body_style = ParagraphStyle(
        'BodyStyle', parent=styles['Normal'], fontSize=12, leading=15,
        alignment=TA_JUSTIFY, spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'BulletStyle', parent=body_style,
        leftIndent=12*mm, bulletIndent=6*mm
    )
    code_style = ParagraphStyle(
        'CodeStyle', parent=styles['Code'], fontSize=10, leading=12,
        fontName='Courier', alignment=TA_LEFT, spaceAfter=6
    )

    story = []
    # Cover
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph("Generated by Science for Genius AI", subtitle_style))
    story.append(Spacer(1, 20*mm))
    cover_line = Drawing(150, 5)
    cover_line.add(Rect(0, 0, 150, 5, fillColor=navy, strokeColor=navy))
    story.append(cover_line)
    story.append(Spacer(1, 30*mm))
    story.append(PageBreak())

    lines = text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        # Detect table
        if '|' in line and i+1 < len(lines) and re.search(r'\|[\s\-:]+\|', lines[i+1]):
            table_rows = []
            while i < len(lines) and '|' in lines[i]:
                row = [cell.strip() for cell in lines[i].split('|') if cell.strip() != '']
                if row:
                    table_rows.append(row)
                i += 1
            if len(table_rows) > 1:
                header = table_rows[0]
                data = table_rows[2:] if len(table_rows) > 2 else []
                table_data = [header] + data
                if table_data:
                    num_cols = max(len(row) for row in table_data)
                    col_widths = [50*mm] * num_cols
                    if num_cols > 4:
                        col_widths = [30*mm] * num_cols
                    t = Table(table_data, colWidths=col_widths, repeatRows=1)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), navy),
                        ('TEXTCOLOR', (0,0), (-1,0), white),
                        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0,0), (-1,0), 10),
                        ('BOTTOMPADDING', (0,0), (-1,0), 6),
                        ('BACKGROUND', (0,1), (-1,-1), lightgrey),
                        ('GRID', (0,0), (-1,-1), 0.5, grey),
                        ('FONTSIZE', (0,1), (-1,-1), 9),
                    ]))
                    story.append(t)
                    story.append(Spacer(1, 6*mm))
                    continue

        # Code block
        if line.startswith('```'):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            if i < len(lines) and lines[i].strip().startswith('```'):
                i += 1
            if code_lines:
                code_text = '\n'.join(code_lines)
                story.append(Paragraph(f'<pre>{code_text}</pre>', code_style))
                story.append(Spacer(1, 3*mm))
            continue

        # Bullet list
        if re.match(r'^[\s]*[-*•]|\d+[.)]\s', line):
            bullet_lines = []
            while i < len(lines) and re.match(r'^[\s]*[-*•]|\d+[.)]\s', lines[i].strip()):
                bullet_lines.append(lines[i].strip())
                i += 1
            for bl in bullet_lines:
                clean = re.sub(r'^[\s]*[-*•]|\d+[.)]\s', '', bl).strip()
                story.append(Paragraph(f'• {clean}', bullet_style))
            story.append(Spacer(1, 2*mm))
            continue

        # Heading
        if len(line) < 60 and (line.endswith(':') or line.isupper()):
            story.append(Paragraph(line, heading_style))
            story.append(Spacer(1, 2*mm))
            i += 1
            continue

        # Normal paragraph
        story.append(Paragraph(line, body_style))
        story.append(Spacer(1, 2*mm))
        i += 1

    # Flow diagram
    steps = re.findall(r'(?:Step\s*(\d+)|(\d+)[.)])\s*:\s*(.*?)(?=\n|$)', text, re.IGNORECASE)
    if len(steps) >= 2:
        flow_drawing = Drawing(500, 100 + len(steps)*30)
        y_start = 80
        box_width = 200
        box_height = 25
        for idx, (s1, s2, desc) in enumerate(steps):
            step_num = s1 or s2
            x = 150
            y = y_start - idx*30
            flow_drawing.add(Rect(x, y, box_width, box_height, fillColor=lightgrey, strokeColor=black))
            flow_drawing.add(String(x+10, y+7, f"Step {step_num}: {desc[:30]}", fontSize=10))
            if idx < len(steps)-1:
                flow_drawing.add(Line(x + box_width/2, y - 5, x + box_width/2, y - 20, strokeColor=black))
                flow_drawing.add(Polygon([x + box_width/2 - 4, y - 20, x + box_width/2 + 4, y - 20, x + box_width/2, y - 28], fillColor=black, strokeColor=black))
        story.append(Spacer(1, 10*mm))
        story.append(Paragraph("Process Flow Diagram", heading_style))
        story.append(flow_drawing)

    def header_footer_watermark(canvas_obj, doc_obj):
        canvas_obj.saveState()
        canvas_obj.setFont('Helvetica', 9)
        canvas_obj.setFillColor(grey)
        canvas_obj.drawString(20*mm, A4[1] - 15*mm, "Science for Genius")
        canvas_obj.drawString(A4[0] - 50*mm, 10*mm, f"Page {doc_obj.page}")
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.setFillColorRGB(0.5, 0.5, 0.5, alpha=0.4)
        canvas_obj.drawRightString(A4[0] - 15*mm, 10*mm, "made by SFG AI")
        canvas_obj.restoreState()

    doc.build(story, onFirstPage=header_footer_watermark, onLaterPages=header_footer_watermark)
    buffer.seek(0)
    return buffer

# ------------------ AI Helpers with History ------------------
def get_user_history(user_id: int) -> list:
    data = user_data.get(str(user_id), {})
    history = data.get("chat_history", deque(maxlen=MAX_HISTORY))
    return list(history)

def update_user_history(user_id: int, role: str, content: str):
    uid = str(user_id)
    if uid not in user_data:
        user_data[uid] = {"chat_history": deque(maxlen=MAX_HISTORY)}
    history = user_data[uid]["chat_history"]
    history.append({"role": role, "content": content})
    # Save to Firestore asynchronously
    if db is not None:
        save_user_data(uid)

def call_groq_with_history(user_id: int, system_prompt: str, new_user_message: str) -> str:
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    messages = [{"role": "system", "content": system_prompt}]
    history = get_user_history(user_id)
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": new_user_message})

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": MAX_RESPONSE_TOKENS,
        "top_p": 0.9,
        "stream": False
    }
    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        if resp.status_code != 200:
            logger.error(f"Groq API error {resp.status_code}: {resp.text}")
            return None
        data = resp.json()
        reply = data["choices"][0]["message"]["content"].strip()
        update_user_history(user_id, "assistant", reply)
        return reply
    except Exception as e:
        logger.exception("Groq call failed")
        return None

def web_search(query: str) -> str:
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=MAX_SEARCH_RESULTS))
            snippets = [f"{i}. {r.get('body', '').strip()}" for i, r in enumerate(results, 1)]
            return "\n".join(snippets) if snippets else "No search results."
    except Exception:
        return "Search unavailable."

# ------------------ Split long messages ------------------
def split_message(text: str, max_len: int = MAX_MESSAGE_LEN) -> list:
    if len(text) <= max_len:
        return [text]
    chunks = []
    current = ""
    for paragraph in text.split('\n\n'):
        if len(current) + len(paragraph) + 2 <= max_len:
            current += paragraph + "\n\n"
        else:
            if current:
                chunks.append(current.strip())
            current = paragraph + "\n\n"
    if current:
        chunks.append(current.strip())
    return chunks

# ------------------ Telegram Handlers ------------------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = (
        "🌱 *Science for Genius AI* 🌱\n"
        "Built by the *SFG Team* using OpenAI.\n\n"
        "I answer science questions for grades 6–11 with:\n"
        "• Short, scannable sections\n"
        "• Emojis for clarity\n"
        "• Bold key terms\n"
        "• Bullet points for lists\n"
        "• A bottom‑line conclusion\n\n"
        "**Commands:**\n"
        "• `/generate <topic>` – get a PDF lesson.\n"
        "• `/summarize` – summarise your uploaded PDF.\n"
        "• `/quiz` – generate a quiz from your PDF.\n"
        "• `/makepdf <text>` – turn text into a PDF.\n"
        "• `/clear` – clear my memory.\n"
        "• `/help` – show this.\n\n"
        "All chat history is saved online – I remember you!\n"
    )
    if db is None:
        msg += "\n⚠️ *Note:* History will NOT be saved across restarts (Firestore not configured)."
    await update.message.reply_text(msg, parse_mode="Markdown")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await start(update, context)

async def clear(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = str(update.effective_user.id)
    if user_id in user_data:
        del user_data[user_id]
        # Also delete from Firestore
        if db is not None:
            try:
                db.collection("chat_history").document(user_id).delete()
            except Exception as e:
                logger.exception("Failed to delete from Firestore")
        await update.message.reply_text("✅ All memory cleared.")
    else:
        await update.message.reply_text("No data to clear.")

# PDF commands (generate, summarize, quiz, makepdf) – unchanged except save on PDF upload
async def generate_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not PDF_WRITE_SUPPORT:
        await update.message.reply_text("PDF generation not available. Install ReportLab.")
        return
    args = context.args
    if not args:
        await update.message.reply_text("Please provide a topic, e.g. `/generate photosynthesis`.")
        return
    topic = ' '.join(args)
    await update.message.reply_text(f"🧠 Generating lesson on *{topic}*...", parse_mode="Markdown")
    system = (
        "You are Science for Genius AI, built by the SFG Team. Write a structured lesson for grades 6–11. "
        "Use clear headings, bullet points, and short paragraphs. Include a summary at the end. "
        "For tables, use Markdown pipe syntax; they will be rendered in the PDF."
    )
    response = call_groq_with_history(update.effective_user.id, system, f"Create a lesson on: {topic}")
    if not response:
        await update.message.reply_text("⚠️ AI failed to generate content.")
        return
    try:
        pdf_buffer = generate_pdf(response, title=f"Lesson on {topic}")
        await update.message.reply_document(
            document=pdf_buffer,
            filename=f"{topic.replace(' ', '_')}_lesson.pdf",
            caption="✅ Lesson generated."
        )
    except Exception as e:
        logger.exception("PDF generation failed")
        await update.message.reply_text("⚠️ Failed to create PDF. Please try again.")

async def summarize_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not PDF_WRITE_SUPPORT:
        await update.message.reply_text("PDF generation not available. Install ReportLab.")
        return
    user_id = str(update.effective_user.id)
    pdf_data = user_data.get(user_id, {})
    pdf_text = pdf_data.get("pdf_text", "")
    pdf_name = pdf_data.get("pdf_name", "Uploaded PDF")
    if not pdf_text:
        await update.message.reply_text("Please upload a PDF first, then use /summarize.")
        return
    await update.message.reply_text("📝 Summarising the PDF...")
    system = "You are Science for Genius AI. Summarise the given content with bullet points and a clear conclusion."
    response = call_groq_with_history(update.effective_user.id, system, f"Summarize this content:\n{pdf_text}")
    if not response:
        await update.message.reply_text("⚠️ AI summarisation failed.")
        return
    try:
        pdf_buffer = generate_pdf(response, title=f"Summary of {pdf_name}")
        await update.message.reply_document(
            document=pdf_buffer,
            filename=f"summary_{pdf_name}",
            caption="✅ Summary generated."
        )
    except Exception as e:
        logger.exception("PDF generation failed")
        await update.message.reply_text("⚠️ Failed to create PDF.")

async def quiz_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not PDF_WRITE_SUPPORT:
        await update.message.reply_text("PDF generation not available. Install ReportLab.")
        return
    user_id = str(update.effective_user.id)
    pdf_data = user_data.get(user_id, {})
    pdf_text = pdf_data.get("pdf_text", "")
    pdf_name = pdf_data.get("pdf_name", "Uploaded PDF")
    if not pdf_text:
        await update.message.reply_text("Please upload a PDF first, then use /quiz.")
        return
    await update.message.reply_text("🧪 Generating a quiz...")
    system = "You are Science for Genius AI. Generate 5–10 questions from the content. Provide answers at the end."
    response = call_groq_with_history(update.effective_user.id, system, f"Generate a quiz from:\n{pdf_text}")
    if not response:
        await update.message.reply_text("⚠️ AI quiz generation failed.")
        return
    try:
        pdf_buffer = generate_pdf(response, title=f"Quiz from {pdf_name}")
        await update.message.reply_document(
            document=pdf_buffer,
            filename=f"quiz_{pdf_name}",
            caption="✅ Quiz generated."
        )
    except Exception as e:
        logger.exception("PDF generation failed")
        await update.message.reply_text("⚠️ Failed to create PDF.")

async def makepdf_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not PDF_WRITE_SUPPORT:
        await update.message.reply_text("PDF generation not available. Install ReportLab.")
        return
    args = context.args
    if not args:
        if update.message.reply_to_message and update.message.reply_to_message.text:
            text = update.message.reply_to_message.text
        else:
            await update.message.reply_text("Please provide text after /makepdf or reply to a message.")
            return
    else:
        text = ' '.join(args)
    if len(text.strip()) < 5:
        await update.message.reply_text("Please provide at least 5 characters.")
        return
    try:
        pdf_buffer = generate_pdf(text, title="Text to PDF")
        await update.message.reply_document(
            document=pdf_buffer,
            filename="text_to_pdf.pdf",
            caption="✅ PDF generated."
        )
    except Exception as e:
        logger.exception("PDF generation failed")
        await update.message.reply_text("⚠️ Failed to create PDF.")

async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not PDF_READ_SUPPORT:
        await update.message.reply_text("PDF reading not available. Install PyPDF2.")
        return
    user_id = str(update.effective_user.id)
    document = update.message.document
    if document.mime_type != "application/pdf":
        await update.message.reply_text("Please send a PDF file.")
        return
    try:
        file = await context.bot.get_file(document.file_id)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            await file.download_to_drive(tmp.name)
            pdf_path = tmp.name
        text = extract_pdf_text(pdf_path)
        os.unlink(pdf_path)
        if not text.strip():
            await update.message.reply_text("Could not extract text (maybe image‑only).")
            return
        if user_id not in user_data:
            user_data[user_id] = {"chat_history": deque(maxlen=MAX_HISTORY)}
        user_data[user_id]["pdf_text"] = text
        user_data[user_id]["pdf_name"] = document.file_name or "document.pdf"
        # Save to Firestore
        if db is not None:
            save_user_data(user_id)
        preview = text[:500] + ("..." if len(text) > 500 else "")
        await update.message.reply_text(
            f"✅ PDF *{document.file_name}* loaded.\nPreview:\n{preview}\n\nNow use /summarize or /quiz.",
            parse_mode="Markdown"
        )
    except Exception as e:
        logger.exception("Document processing failed")
        await update.message.reply_text("⚠️ Error processing PDF.")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = str(update.effective_user.id)
    question = update.message.text.strip()
    if not question:
        return

    update_user_history(int(user_id), "user", question)

    pdf_text = user_data.get(user_id, {}).get("pdf_text", "")
    pdf_name = user_data.get(user_id, {}).get("pdf_name", "")

    system = (
        "You are Science for Genius AI, built by the SFG Team using OpenAI. "
        "You are a science teacher for grades 6–11. Follow these formatting rules strictly:\n"
        "- Do NOT use tables in chat – they are hard to read on phones.\n"
        "- Use short sections with clear headings (prefixed with emojis like 📘, 🔬, 💡).\n"
        "- Use emojis sparingly to make sections scannable.\n"
        "- Bold important terms with *asterisks* (e.g., *photosynthesis*).\n"
        "- Keep each paragraph to 2–4 lines.\n"
        "- Use bullet points (•) instead of long prose.\n"
        "- Separate scientifically established facts, theoretical ideas, and science‑fiction concepts clearly.\n"
        "- Always end with a clear bottom‑line conclusion marked with ✅.\n"
        "- Keep the overall response concise but complete."
    )
    if pdf_text:
        system += f"\nThe user has uploaded a PDF '{pdf_name}'. Use it when relevant."

    search_results = web_search(question)
    user_prompt = f"Question: {question}\n\nWeb search results (use only if helpful):\n{search_results}"

    response = call_groq_with_history(int(user_id), system, user_prompt)
    if response is None:
        await update.message.reply_text("⚠️ I'm having trouble responding. Please try again later.")
        return

    chunks = split_message(response)
    for chunk in chunks:
        await update.message.reply_text(chunk, parse_mode="Markdown")

# Error handler
async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    logger.error("Exception:", exc_info=context.error)
    if update and update.effective_message:
        await update.effective_message.reply_text("⚠️ An unexpected error occurred. Please try again later.")

# ------------------ Main ------------------
def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("clear", clear))
    app.add_handler(CommandHandler("generate", generate_command))
    app.add_handler(CommandHandler("summarize", summarize_command))
    app.add_handler(CommandHandler("quiz", quiz_command))
    app.add_handler(CommandHandler("makepdf", makepdf_command))
    app.add_handler(MessageHandler(filters.Document.ALL, handle_document))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(error_handler)
    logger.info("Bot started with Firebase persistence.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()