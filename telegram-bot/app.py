import os
import json
import logging
import requests
import tempfile
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from duckduckgo_search import DDGS
#made by lewmitha

try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    logging.warning("PyPDF2 not installed. PDF features disabled.")


TELEGRAM_TOKEN = "8793608790:AAGwcZeIektGBScIz1C_u6OS8FgPNmqCpwQ"
GROQ_API_KEY = "api_key"


GROQ_API_KEY = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", TELEGRAM_TOKEN)

if not TELEGRAM_TOKEN:
    raise ValueError("TELEGRAM_TOKEN is not set.")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set.")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "openai/gpt-oss-120b"          
MAX_SEARCH_RESULTS = 5
MAX_PDF_PAGES = 20
MAX_PDF_TEXT_LEN = 15000

user_context = {}

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

def extract_pdf_text(pdf_path: str) -> str:
    """Extract text from a PDF using PyPDF2."""
    if not PDF_SUPPORT:
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


def web_search(query: str) -> str:
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=MAX_SEARCH_RESULTS))
            if not results:
                return "No search results found."
            snippets = []
            for i, r in enumerate(results, 1):
                snippets.append(f"{i}. {r.get('body', '').strip()}")
            return "\n".join(snippets)
    except Exception as e:
        logger.exception("Search failed")
        return "Search unavailable."
      
def groq_chat(system_prompt: str, user_prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 800,
        "top_p": 0.9,
        "stream": False
    }
    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        if resp.status_code == 401:
            logger.error("Groq API key invalid.")
            return "⚠️ **Your Groq API key is invalid.** Please check it."
        if resp.status_code != 200:
            logger.error(f"Groq API error {resp.status_code}: {resp.text}")
            return f"⚠️ Groq API error {resp.status_code}. Please try later."

        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
    except requests.exceptions.RequestException as e:
        logger.exception("Groq API call failed")
        return "⚠️ Sorry, I couldn't get a response from the AI. Please try again later."
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        logger.exception("Unexpected Groq response format")
        return "⚠️ Unexpected response from AI. Please try again."

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = (
        "🌱 *Science for genius AI* 🌱\n\n"
        "I'm your virtual science teacher for grades 6–11.\n"
        "You can:\n"
        "• Send a **PDF** – I'll read it and remember its content.\n"
        "• Ask a question – I'll answer using the PDF (if available) + web search.\n"
        "• Use /clear to forget the current PDF.\n\n"
        "Send me your question or a PDF!"
    )
    if not PDF_SUPPORT:
        msg += "\n\n⚠️ *Note:* PDF reading is currently disabled because the required library is not installed."
    await update.message.reply_text(msg, parse_mode="Markdown")

async def clear(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    if user_id in user_context:
        del user_context[user_id]
        await update.message.reply_text("✅ PDF memory cleared.")
    else:
        await update.message.reply_text("No PDF stored to clear.")

async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not PDF_SUPPORT:
        await update.message.reply_text(
            "⚠️ PDF support is not available in this environment. "
            "Please install PyPDF2 (pip install PyPDF2) to enable it."
        )
        return

    user_id = update.effective_user.id
    document = update.message.document
    if not document:
        return

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
            await update.message.reply_text(
                "⚠️ Could not extract text from this PDF. It may be image‑only or corrupted."
            )
            return

        user_context[user_id] = {
            "pdf_text": text,
            "pdf_name": document.file_name or "Untitled"
        }
        preview = text[:500] + ("..." if len(text) > 500 else "")
        await update.message.reply_text(
            f"✅ PDF *{document.file_name}* loaded and remembered.\n"
            f"Preview:\n\n{preview}\n\n"
            f"Now you can ask questions about it.",
            parse_mode="Markdown"
        )
    except Exception as e:
        logger.exception("Failed to process document")
        await update.message.reply_text("⚠️ An error occurred while processing the PDF. Please try again.")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    question = update.message.text.strip()
    if not question:
        return

    pdf_text = user_context.get(user_id, {}).get("pdf_text", "")
    pdf_name = user_context.get(user_id, {}).get("pdf_name", "")

    if pdf_text:
        system_prompt = (
            "You are Science for Genius AI, a kind science teacher for grades 6–11. "
            "The user has provided a PDF document. Use the content of this PDF to answer the question. "
            "If the question is not covered by the PDF, you may use general knowledge or web search results "
            "provided in the user's query. Answer in the same language as the question.\n\n"
            f"PDF content (from '{pdf_name}'):\n{pdf_text}"
        )
    else:
        system_prompt = (
            "You are Science for Genius AI , a kind science teacher for grades 6–11. "
            "Answer the question using general knowledge and the web search results provided. "
            "If the user asks about a PDF they sent earlier, kindly remind them to upload it again."
        )

    search_results = web_search(question)
    if pdf_text:
        user_prompt = f"Question: {question}\n\nSupplementary web search results (use if needed):\n{search_results}"
    else:
        user_prompt = f"Question: {question}\n\nWeb search results:\n{search_results}"

    reply = groq_chat(system_prompt, user_prompt)
    await update.message.reply_text(reply, parse_mode="Markdown")

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    logger.error(msg="Exception while handling an update:", exc_info=context.error)
    if update and update.effective_message:
        await update.effective_message.reply_text(
            "⚠️ An unexpected error occurred. Please try again later."
        )

def main():
    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("clear", clear))
    app.add_handler(MessageHandler(filters.Document.ALL, handle_document))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(error_handler)

    logger.info("Science bot with PDF support is starting...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
