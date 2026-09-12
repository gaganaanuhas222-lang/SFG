export type assessment_type = tute | recordings | live_class;

export interface person {
    first_name : string,
    last_name : string,
    role : string,
    status : string,
    uniqe_id : string,
}

export interface login_credentials{
    person_id : number,
    password_hash : string,
}

export interface paymet_history{
    payment_id : string,
    amount : number,
    payment_for : string,
    pay_by_stundet_id : number,
    status : string,
    prices : price_list
}

export interface price_list{
    amount : number,
    currency : string,
}

export interface timetable{
    start_datetime : string,
    end_datetime : string,
    grade : string,
    prices : price_list
}

export interface school_details {
    school_name : string,
    district : string,
}

export interface address {
    city : string,
    address_line01 : string,
    address_line02? : string,
}
export interface guardian{
    name : string,
    mobile : string,
}

export interface student extends person{
    isVerify : boolean,
    grade : string,
    academic_year? : string,
    sch_data? : school_details, 
    address? : address,
    guradian_data? : guardian,
    lastSeen? : string,
}

export interface admin extends person{}

export interface assessment_genaral{
    title : string,
    description : string,
    upload_on : string,
    assessment_id : string,
    status : string,
    upload_by_person_id : number,
    price : price_list
}

export interface tute extends assessment_genaral{
    file_id : string
}

export interface recordings extends assessment_genaral{
    video_id : string
}

export interface live_class extends assessment_genaral {
    timeDate : string,
    by : string,
    link : string,
}

export interface announcement {
    grade : string,
    title : string,
    message : string
}

export interface bank_details {
    bank_name : string,
    acc_name : string,
    acc_number : number,
    branch : string,
}
