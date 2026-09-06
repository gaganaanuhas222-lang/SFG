interface person {
    first_name : string,
    last_name : string,
    role : string,
    status : string,
    uniqe_id : string,
}

interface login_credentials{
    person_id : number,
    password_hash : string,
}

interface paymet_history{
    payment_id : string,
    amount : number,
    payment_for : string,
    pay_by_stundet_id : number,
    status : string,
    prices : price_list
}

interface price_list{
    amount : number,
    currency : string,
}

interface timetable{
    start_datetime : string,
    end_datetime : string,
    grade : string,
    prices : price_list
}

interface student extends person{
    isVerify : boolean,
    grade : string,
    lastSeen? : string,
}

interface assessment_genaral{
    title : string,
    description : string,
    upload_on : string,
    assessment_id : string,
    status : string,
    upload_by_person_id : number,
    price : price_list
}

interface tute extends assessment_genaral{
    file_id : string
}

interface recordings extends assessment_genaral{
    video_id : string
}

interface live_class extends assessment_genaral {
    timeDate : string,
    by : string,
    link : string,
}

interface announcement {
    grade : string,
    title : string,
    message : string
}
