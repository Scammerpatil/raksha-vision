"use client";
import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    profileImage: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        profileImage: user.profileImage || "",
      });
      setImagePreview(user.profileImage || "");
    }
  }, [user]);

  const handleProfileImageChange = (
    folderName: string,
    imageName: string,
    path: string
  ) => {
    if (!formData.name) {
      toast.error("Name is required for images");
      return;
    }
    if (profileImage) {
      if (profileImage.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB");
        return;
      }
      const imageResponse = axios.postForm(
        `/api/helper/upload-img?name=${imageName}&folderName=${folderName}`,
        { file: profileImage }
      );
      toast.promise(imageResponse, {
        loading: "Uploading Image...",
        success: (data: AxiosResponse) => {
          setFormData({
            ...formData,
            [path]: data.data.path,
          });
          return "Image Uploaded Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData((prev) => ({
        ...prev,
        profileImage: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    try {
      const res = axios.put("/api/auth/update", { user: formData });
      toast.promise(res, {
        loading: "Updating Profile...",
        success: (data: AxiosResponse) => {
          setUser(data.data.user);
          return "Profile Updated Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loading />;

  return (
    <div className="">
      <div className="bg-base-200 shadow-xl rounded-xl p-6 space-y-4 mt-4 max-w-3xl mx-auto mb-10">
        <div className="flex flex-col items-center gap-3">
          <div className="avatar">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={
                  imagePreview ||
                  "https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
                }
                alt="Profile"
              />
            </div>
          </div>

          <div className="join">
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered file-input-primary w-full max-w-xs"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProfileImage(e.target.files[0]);
                  handleImageChange(e);
                }
              }}
            />
            <button
              className="btn btn-primary join-item"
              onClick={() => {
                handleProfileImageChange(
                  "profileImage",
                  formData.name,
                  "profileImage"
                );
              }}
            >
              Upload Image
            </button>
          </div>
        </div>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Full Name <span className="text-error">*</span>
          </legend>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="input input-bordered w-full"
            required
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Email</legend>
          <div
            className="input input-bordered w-full bg-base-300 cursor-not-allowed"
            data-tip="Email cannot be changed"
          >
            {formData.email}
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            Phone <span className="text-error">*</span>
          </legend>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="input input-bordered w-full"
            pattern="[0-9]{10}"
            minLength={10}
            maxLength={10}
            required
          />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            New Password <span className="text-error">*</span>
          </legend>
          <div className="join">
            <input
              type={isVisible ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="input input-bordered w-full"
              required
            />
            <button
              type="button"
              className="btn btn-square btn-primary join-item"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? <IconEyeOff size={20} /> : <IconEye size={20} />}
            </button>
          </div>
          <div className="text-sm mt-1 text-base-content/70">
            Leave blank to keep existing password.
          </div>
        </fieldset>
        <button
          className={`btn btn-primary w-full mt-4 ${loading ? "loading" : ""}`}
          onClick={handleSubmit}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
