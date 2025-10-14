import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import axios from 'axios';

// import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { UserDetail } from '@/types/user-detail';

import SaveConfirmationModal from '@/components/modals/SaveConfirmationModal';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender?: 'female' | 'male' | 'other' | '';
    contact_no?: string;
    image?: File | null;

    remove_image?: boolean;
};


export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, userDetail } = usePage<SharedData & { userDetail?: UserDetail | null }>().props;

    const canManageProfile = auth?.permissions?.includes('manage-profile');

    const { data, setData, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        name: auth?.user?.name ?? '',
        email: auth?.user?.email ?? '',
        first_name: userDetail?.first_name || '',
        middle_name: userDetail?.middle_name || '',
        last_name: userDetail?.last_name || '',
        gender: userDetail?.gender || '',
        contact_no: userDetail?.contact_no || '',
        image: null,
    });
    
    
    const [showSaved, setShowSaved] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    const handleConfirmRemove = () => {
        setData('image', null);
        setData('remove_image', true);
        setShowRemoveConfirm(false);
    };

    const refreshProfile = async () => {
        try {
            const res = await axios.get(route('profile.fetch'));
            const refreshed = res.data.detail;
            // Update form state with latest DB data
            setData({
                ...data,
                first_name: refreshed?.first_name || '',
                middle_name: refreshed?.middle_name || '',
                last_name: refreshed?.last_name || '',
                gender: refreshed?.gender || '',
                contact_no: refreshed?.contact_no || '',
                image: null,
                remove_image: false,
            });
        } catch (err) {
            console.error('Failed to refresh profile:', err);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (/\s/.test(data.name)) {
            errors.name = 'Username cannot contain spaces.';
            return;
        }

        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '');

        (Object.entries(data) as [keyof ProfileForm, FormDataEntryValue | File | null][]).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'string') {
                formData.append(key, value);
            } else if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        // router.post(route('profile.update'), formData, {
        //     preserveScroll: true,
        //     onSuccess: () => setShowSaved(true),
        // });
        router.post(route('profile.update'), formData, {
            preserveScroll: true,
            onSuccess: async () => {
                await refreshProfile();
                setShowSaved(true);
            },
        });

    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name, contact details, and profile picture." />

                    {/* Form Container */}
                    <form onSubmit={submit} className="flex flex-col gap-12 px-2 md:flex-row md:px-6">
                        {/* LEFT SIDE — Form Fields */}
                        <div className="flex-1 space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Username</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value.replace(/\s/g, ''))}
                                    required
                                    placeholder="Username"
                                    disabled={!canManageProfile}
                                    className='cursor-pointer disabled:bg-gray-300'
                                />
                                <InputError className="mt-2" message={errors.name || (/\s/.test(data.name) ? 'Username cannot contain spaces.' : '')} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    placeholder="Email address"
                                    disabled={!canManageProfile}
                                    className='cursor-pointer disabled:bg-gray-300'
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth?.user?.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        Your email address is unverified.{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                        >
                                            Click here to resend the verification email.
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has been sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input 
                                    id="first_name" 
                                    value={data.first_name} 
                                    onChange={(e) => setData('first_name', e.target.value)} 
                                    required
                                    disabled={!canManageProfile}
                                    className='cursor-pointer disabled:bg-gray-300'
                                />
                                <InputError message={errors.first_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="middle_name">Middle Name</Label>
                                <Input 
                                    id="middle_name" 
                                    value={data.middle_name || ''} 
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    disabled={!canManageProfile}
                                    className='cursor-pointer disabled:bg-gray-300'
                                />
                                <InputError message={errors.middle_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input 
                                    id="last_name" 
                                    value={data.last_name} 
                                    onChange={(e) => setData('last_name', e.target.value)} 
                                    required
                                    disabled={!canManageProfile}
                                    className='cursor-pointer disabled:bg-gray-300'
                                />
                                <InputError message={errors.last_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    value={data.gender || ''}
                                    onChange={(e) => setData('gender', e.target.value as 'female' | 'male' | 'other' | '')}
                                    className="cursor-pointer rounded-md border p-2 text-sm disabled:cursor-default  disabled:bg-gray-200"
                                    disabled={!canManageProfile}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="other">Other</option>
                                </select>
                                <InputError message={errors.gender} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_no">Contact Number</Label>
                                <Input
                                    id="contact_no"
                                    type="text"
                                    placeholder="+63 912 345 6789"
                                    value={data.contact_no || ''}
                                    onChange={(e) => setData('contact_no', e.target.value)}
                                    disabled={!canManageProfile}
                                    className='cursor-pointer disabled:bg-gray-300'
                                />
                                <InputError message={errors.contact_no} />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                {canManageProfile && (
                                    <Button 
                                        disabled={processing} 
                                        className="cursor-pointer"
                                    >
                                        Save
                                    </Button>
                                )}

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">Saved</p>
                                </Transition>
                            </div>
                        </div>

                        {/* RIGHT SIDE — Profile Image */}
                        <div className="w-full md:w-[380px]">
                            <div className="flex flex-col items-center rounded-2xl border bg-white p-8 text-center shadow-md dark:bg-neutral-900">
                                <Label className="mb-5 text-lg font-semibold">Profile Picture</Label>

                                <div className="group relative mb-6">
                                    {/* Hidden input but linked by label htmlFor */}
                                    <input
                                        id="profileImageInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) setData('image', e.target.files[0]);
                                        }}
                                        className="hidden"
                                    />

                                    {/* Label wraps the image preview for clickable behavior */}
                                    <label htmlFor="profileImageInput" className="group relative block cursor-pointer">
                                   {data.image ? (
    // Local preview if a new image is selected
    <img
        src={URL.createObjectURL(data.image as File)}
        alt="Preview"
        className="h-44 w-44 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-blue-200 transition-transform duration-300 group-hover:scale-105 dark:ring-blue-400"
    />
) : auth?.user?.avatar ? (
    // Persistent avatar (from shared props)
    <img
        src={auth.user.avatar}
        alt="Profile"
        className="h-44 w-44 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-blue-200 transition-transform duration-300 group-hover:scale-105 dark:ring-blue-400"
        onError={(e) => {
            e.currentTarget.src = '/images/placeholder.png';
        }}
    />
) : (
    // Fallback placeholder
    <div className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
        No Image
    </div>
)}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <span className="text-sm font-medium text-white">Click to Change</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Hidden real input */}
                                <input
                                    id="fileUploadInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) setData('image', e.target.files[0]);
                                    }}
                                    className="hidden"
                                />

                                {/* File and Remove buttons row */}
                                <div className="mt-3 flex items-center justify-center gap-3">
                                    {/* Choose File */}
                                    {canManageProfile && (
                                        <label
                                            htmlFor="fileUploadInput"
                                            className="inline-block cursor-pointer rounded-lg border bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-100 active:bg-blue-200"
                                        >
                                            Choose File
                                        </label>
                                    )}

                                    {/* Remove Image */}
                                    {(userDetail?.image_path || data.image) && (
                                        <Button
                                            type="button"
                                            variant={data.remove_image ? "outline" : "destructive"}
                                            className="text-sm cursor-pointer"
                                            onClick={() => {
                                                if (data.remove_image) {
                                                    setData('remove_image', false);
                                                    setData('image', null);
                                                } else {
                                                    setShowRemoveConfirm(true);
                                                }
                                            }}
                                        >
                                            {data.remove_image ? 'Undo Remove' : 'Remove Image'}
                                        </Button>
                                    )}
                                </div>

                                <p className="mt-4 text-xs text-muted-foreground leading-snug">
                                    Accepted formats: <span className="font-medium">JPG, PNG, WEBP</span><br />
                                    Max size: <span className="font-medium">5MB</span>
                                </p>

                                <InputError message={errors.image} />

                            </div>
                            
                            {/* <div className="mt-8 w-full">
                                <DeleteUser />
                            </div> */}

                            {/* <pre className="mt-6 max-h-64 overflow-auto rounded-lg bg-neutral-900 p-3 text-xs text-green-400">
                                {JSON.stringify(userDetail?.image_path, null, 2)}
                            </pre> */}
                        </div>
                    </form>
                </div>

                <SaveConfirmationModal
                    show={showSaved}
                    onClose={() => setShowSaved(false)}
                    title="Profile Updated"
                    message="Your profile changes have been saved successfully."
                />

                {/* Confirm Remove Image Modal */}
                <ConfirmActionModal
                    show={showRemoveConfirm}
                    onCancel={() => setShowRemoveConfirm(false)}
                    onConfirm={handleConfirmRemove}
                    title="Confirm Image Removal"
                    message={
                        <>
                            Are you sure you want to remove your profile image?
                            <br />
                            This change will only take effect after you click <strong>Save</strong>.
                        </>
                    }
                    confirmText="Yes, Remove"
                    cancelText="Cancel"
                />
            </SettingsLayout>
        </AppLayout>
    );
}
