export interface Contractor{
    contractor_id: string;
    name: string;
    contact_info: string;
    address: string;
    other_details: string;
}

export const ContractorSchema = {
    contractor_id: String,
    name: String,
    contact_info: String,
    address: String,
    other_details: String,
}