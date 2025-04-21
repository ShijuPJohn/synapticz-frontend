'use client';

import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import axios from "axios";
import {useSelector} from "react-redux";
import Image from "next/image";
import {fetchURL} from "@/constants";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons";
import {TextField} from "@mui/material";

export default function EditProfilePage() {
    const {userInfo} = useSelector((state) => state.user);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: {errors},
    } = useForm();

    // Fetch current user profile on load
    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await axios.get(`${fetchURL}/auth/users`, {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                });
                console.log(res.data);
                const data = res.data.user;
                reset({
                    name: data.name,
                    email: data.email,
                    about: data.about || "",
                });
                setUploadedUrl(data.profile_pic || null);
                setProfilePicPreview(data.profile_pic || null);
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        }

        fetchProfile();
    }, [reset, userInfo.token]);

    // Upload Image to GCS
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProfilePicPreview(URL.createObjectURL(file)); // For preview

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${fetchURL}/image-upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });

            setUploadedUrl(res.data.url);
        } catch (err) {
            console.error("Failed to upload image", err);
        }
    };

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            await axios.put(
                `${fetchURL}/auth/users/`,
                {
                    ...formData,
                    profile_pic: uploadedUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                }
            );
            alert("Profile updated!");
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
      <main>
          <div className="sm:w-[50%] mx-auto px-24 py-10 bg-white">
              <h1 className="text-3xl font-bold text-slate-800 mb-6">Edit Profile</h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="flex items-center gap-4">
                      <div className="w-36 h-36 rounded-full overflow-hidden border border-slate-200 shadow">
                          {profilePicPreview ? (
                              <Image
                                  src={profilePicPreview}
                                  alt="Profile"
                                  width={96}
                                  height={96}
                                  priority
                                  className="object-cover w-full h-full"
                              />
                          ) : (
                              <div className="w-full h-full bg-gray-200"/>
                          )}
                      </div>

                      <label className="cursor-pointer text-blue-600 text-xl">
                          <FontAwesomeIcon icon={faEdit}/>
                          &nbsp; Change Photo
                          <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                          />
                      </label>
                  </div>

                  {/* Name */}
                  <div>
                      <TextField
                          error={!!errors.username}
                          helperText={errors.username ? errors.username.message : null}
                          autoFocus
                          value={name}
                          label="Full Name"
                          {...register("username", {
                              required: "Required",
                              minLength: {value: 3, message: "Username should be at least 3 characters"},
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      {errors.name && (
                          <p className="text-red-500 text-sm mt-1">Name is required</p>
                      )}
                  </div>

                  {/* Email (disabled) */}
                  <div>
                      <TextField
                          disabled
                          label="Email"
                          {...register("email")}
                          className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm"
                      />
                  </div>

                  {/* About */}
                      <TextField
                          error={!!errors.about}
                          helperText={errors.about ? errors.about.message : null}
                          autoFocus
                          label="About"
                          {...register("about", {
                              required: "Required",
                              minLength: {value: 3, message: "About should be at least 3 characters"},
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <TextField
                          error={!!errors.goal}
                          helperText={errors.goal ? errors.goal.message : null}
                          autoFocus
                          label="Goal"
                          {...register("goal", {
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <TextField
                          error={!!errors.linkedin}
                          helperText={errors.linkedin ? errors.linkedin.message : null}
                          autoFocus
                          label="LinkedIn"
                          {...register("linkedin", {
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <TextField
                          error={!!errors.instagram}
                          helperText={errors.instagram ? errors.instagram.message : null}
                          autoFocus
                          label="Instagram"
                          {...register("instagram", {
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <TextField
                          error={!!errors.facebook}
                          helperText={errors.facebook ? errors.facebook.message : null}
                          autoFocus
                          label="Facebook"
                          {...register("facebook", {
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                      />

                  <button
                      type="submit"
                      disabled={loading}
                      className="bg-cyan-600 text-white py-2 px-6 rounded-md hover:bg-cyan-700 disabled:opacity-50 transition"
                  >
                      {loading ? "Submitting..." : "Submit"}
                  </button>
              </form>
          </div>
      </main>
    );
}
