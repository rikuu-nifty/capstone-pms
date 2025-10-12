export type UserDetail = {
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender?: 'female' | 'male' | 'other' | '';
    contact_no?: string;
    image_path?: string | null;

    image_url?: string | null;
};
