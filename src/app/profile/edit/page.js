'use client';

import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import axios from "axios";
import {useSelector} from "react-redux";
import Image from "next/image";
import {fetchURL} from "@/constants";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight, faEdit} from "@fortawesome/free-solid-svg-icons";
import {
    CircularProgress,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import {enqueueSnackbar} from "notistack";
import countries from 'world-countries';
import Link from "next/link";

export default function EditProfilePage() {
    const {userInfo} = useSelector((state) => state.user);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");

    const countryList = countries.map((country) => ({
        label: country.name.common,
        value: country.cca2,
    }));

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: {errors},
    } = useForm();

    const selectedCountry = watch("country");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await axios.get(`${fetchURL}/auth/users`, {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                });

                const user = res.data.user;
                reset({
                    name: user.name || "",
                    about: user.about || "",
                    goal: user.goal || "",
                    linkedin: user.linkedin || "",
                    facebook: user.facebook || "",
                    instagram: user.instagram || "",
                    country: user.country || "",
                    country_code: user.country_code || "",
                    mobile_number: user.mobile_number || "",
                });
                setEmail(user.email || "");
                setProfilePicPreview(user.profile_pic || null);
                setUploadedUrl(user.profile_pic || null);
            } catch (err) {
                console.error("Failed to fetch user data", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [reset, setValue, userInfo.token]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProfilePicPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${fetchURL}/image-upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });
            enqueueSnackbar("Image uploaded successfully.", {variant: "success"});
            setUploadedUrl(res.data.url);
        } catch (err) {
            console.error("Failed to upload image", err);
        }
    };

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            await axios.put(
                `${fetchURL}/auth/users`,
                {
                    ...formData,
                    profile_pic: uploadedUrl,
                    mobile_number: formData.mobile_number,
                    country_code: formData.country_code,
                },
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                }
            );
            enqueueSnackbar("Profile updated", {variant: "success"});
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            {loading ? (
                <div className="w-full h-[80vh] flex justify-center items-center">
                    <CircularProgress size={"lg"}/>
                </div>
            ) : (
                <div className="sm:w-[50%] mx-auto px-6 py-10 bg-white">
                    <div className="title-container flex justify-between ">
                        <h1 className="text-3xl font-bold text-slate-800 mb-6">Edit Profile</h1>
                        <Link href={"/quizzes"} className={"text-sm md:text-lg text-indigo-700 flex items-center gap-2 border border-indigo-500 px-4 rounded-xl "}>Skip<FontAwesomeIcon icon={faArrowRight}/></Link>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col justify-center items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-36 h-36 rounded-full overflow-hidden border border-slate-200 shadow">
                                {profilePicPreview ? (
                                    <Image
                                        src={profilePicPreview}
                                        alt="Profile"
                                        width={144}
                                        height={144}
                                        priority
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200"/>
                                )}
                            </div>
                            <label className="cursor-pointer text-blue-600 text-lg">
                                <FontAwesomeIcon icon={faEdit}/> Change Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>

                        <TextField
                            label="Full Name"
                            fullWidth
                            {...register("name", {
                                required: "Name is required",
                                minLength: {value: 3, message: "At least 3 characters"},
                            })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            slotProps={{
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                        />

                        <TextField
                            label="Email"
                            fullWidth
                            disabled
                            value={email}
                        />

                        <TextField
                            label="About"
                            fullWidth
                            multiline
                            rows={3}
                            {...register("about")}
                            error={!!errors.about}
                            helperText={errors.about?.message}
                            slotProps={{
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                        />

                        <TextField
                            label="Goal"
                            fullWidth
                            {...register("goal")}
                            error={!!errors.goal}
                            helperText={errors.goal?.message}
                            slotProps={{
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                        />

                        <TextField
                            label="LinkedIn"
                            fullWidth
                            {...register("linkedin")}
                            error={!!errors.linkedin}
                            helperText={errors.linkedin?.message}
                            slotProps={{
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                        />

                        <TextField
                            label="Instagram"
                            fullWidth
                            {...register("instagram")}
                            error={!!errors.instagram}
                            helperText={errors.instagram?.message}
                            slotProps={{
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                        />

                        <TextField
                            label="Facebook"
                            fullWidth
                            {...register("facebook")}
                            error={!!errors.facebook}
                            helperText={errors.facebook?.message}
                            slotProps={{
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                        />

                        <FormControl fullWidth error={!!errors.country}>
                            <InputLabel id="country-label" shrink>Country</InputLabel>
                            <Select
                                labelId="country-label"
                                label="Country" // <-- This is the fix
                                displayEmpty
                                defaultValue=""
                                {...register("country", { required: "Country is required" })}
                                value={selectedCountry || ""}
                                onChange={(e) => setValue("country", e.target.value)}
                            >
                                {countryList.map((country) => (
                                    <MenuItem key={country.value} value={country.label}>
                                        {country.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>}
                        </FormControl>

                        <div className="flex gap-4 w-full">
                            <FormControl className="w-1/3" error={!!errors.country_code}>
                                <InputLabel id="code-label" shrink>Country Code</InputLabel>
                                <Select
                                    labelId="code-label"
                                    label={"Country Code"}
                                    displayEmpty
                                    defaultValue=""
                                    {...register("country_code")}
                                    value={watch("country_code") || ""}
                                    onChange={(e) => setValue("country_code", e.target.value)}
                                >
                                    {countries.map((c) => {
                                        const callingCode =
                                            c.idd?.root && c.idd?.suffixes?.length
                                                ? `${c.idd.root}${c.idd.suffixes[0]}`
                                                : "";

                                        return (
                                            <MenuItem key={c.cca2} value={`${callingCode}`}>
                                                {callingCode ? `${callingCode} (${c.cca2})` : `(${c.cca2})`}
                                            </MenuItem>
                                        );
                                    })}

                                </Select>
                                {errors.country_code && <p className="text-red-600 text-sm mt-1">{errors.country_code.message}</p>}
                            </FormControl>

                            <TextField
                                className="w-2/3"
                                label="Mobile Number"
                                {...register("mobile_number", {
                                    pattern: {
                                        value: /^[0-9]{7,15}$/,
                                        message: "Invalid mobile number"
                                    }
                                })}
                                error={!!errors.mobile_number}
                                helperText={errors.mobile_number?.message}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-cyan-600 text-white py-2 px-6 rounded-md hover:bg-cyan-700 disabled:opacity-50 transition"
                        >
                            {loading ? "Submitting..." : "Update Profile"}
                        </button>
                    </form>
                </div>
            )}
        </main>
    );
}
