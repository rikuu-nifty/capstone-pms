import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

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
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth, userDetail } = usePage<SharedData & { userDetail?: UserDetail | null }>().props;

    const { data, setData, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        name: auth.user.name,
        email: auth.user.email,
        first_name: userDetail?.first_name || '',
        middle_name: userDetail?.middle_name || '',
        last_name: userDetail?.last_name || '',
        gender: userDetail?.gender || '',
        contact_no: userDetail?.contact_no || '',
        image: null,
    });

    const [showSaved, setShowSaved] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append(
            '_token',
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
        );

        (Object.entries(data) as [keyof ProfileForm, FormDataEntryValue | File | null][]).forEach(
            ([key, value]) => {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (typeof value === 'string') {
                    formData.append(key, value);
                } else if (value !== null && value !== undefined) {
                    formData.append(key, String(value));
                }
            }
        );

        router.post(route('profile.update'), formData, {
            preserveScroll: true,
            onSuccess: () => setShowSaved(true),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile information"
                        description="Update your name, contact details, and profile picture."
                    />

                    {/* Form Container */}
                    <form
                        onSubmit={submit}
                        className="flex flex-col md:flex-row gap-12 px-2 md:px-6"
                    >
                        {/* LEFT SIDE — Form Fields */}
                        <div className="flex-1 space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Username</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="Username"
                                />
                                <InputError className="mt-2" message={errors.name} />
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
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
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
                                />
                                <InputError message={errors.first_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="middle_name">Middle Name</Label>
                                <Input
                                    id="middle_name"
                                    value={data.middle_name || ''}
                                    onChange={(e) => setData('middle_name', e.target.value)}
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
                                />
                                <InputError message={errors.last_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    value={data.gender || ''}
                                    onChange={(e) =>
                                        setData('gender', e.target.value as 'female' | 'male' | 'other' | '')
                                    }
                                    className="border rounded-md p-2 text-sm cursor-pointer"
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
                                />
                                <InputError message={errors.contact_no} />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button disabled={processing} className="cursor-pointer">
                                    Save
                                </Button>
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
                            <div className="rounded-2xl border bg-white dark:bg-neutral-900 shadow-md p-8 flex flex-col items-center text-center">
                                <Label className="text-lg font-semibold mb-5">Profile Picture</Label>

                                <div className="relative group mb-6">
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
                                    <label htmlFor="profileImageInput" className="cursor-pointer block relative group">
                                        {data.image ? (
                                            <img
                                                src={URL.createObjectURL(data.image as File)}
                                                alt="Preview"
                                                className="h-44 w-44 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-blue-200 dark:ring-blue-400 transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : userDetail?.image_path ? (
                                            <img
                                                src={`/storage/${userDetail.image_path}`}
                                                alt="Profile"
                                                className="h-44 w-44 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-blue-200 dark:ring-blue-400 transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                                                No Image
                                            </div>
                                        )}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">Click to Change</span>
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

                                {/* Styled label acting as custom button */}
                                <label
                                    htmlFor="fileUploadInput"
                                    className="mt-3 inline-block cursor-pointer rounded-lg border bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-100 active:bg-blue-200"
                                >
                                    Choose File
                                </label>

                                <p className="mt-4 text-xs text-muted-foreground leading-snug">
                                    Accepted formats: <span className="font-medium">JPG, PNG, WEBP</span><br />
                                    Max size: <span className="font-medium">5MB</span>
                                </p>

                                <InputError message={errors.image} />
                            </div>
                            
                            {/* <div className="mt-8 w-full">
                                <DeleteUser />
                            </div> */}
                        </div>
                    </form>
                </div>
                
                <SaveConfirmationModal
                    show={showSaved}
                    onClose={() => setShowSaved(false)}
                    title="Profile Updated"
                    message="Your profile changes have been saved successfully."
                />
            </SettingsLayout>
        </AppLayout>
    );
}
