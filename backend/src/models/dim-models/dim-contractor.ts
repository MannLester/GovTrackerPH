export interface Contractor {
    contractor_id: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    license_number?: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateContractorRequest {
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    license_number?: string;
}

export interface UpdateContractorRequest {
    company_name?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    license_number?: string;
    is_active?: boolean;
}

export interface DeleteContractorRequest {
    contractor_id: string;
}

export interface GetContractorRequest {
    contractor_id: string;
}

export const ContractorSchema = {
    contractor_id: String,
    company_name: String,
    contact_person: String,
    email: String,
    phone: String,
    address: String,
    license_number: String,
    is_active: Boolean,
    created_at: Date,
    updated_at: Date
}