"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { Soldier } from "@/Types";
import {
  IconCancel,
  IconCloudUpload,
  IconEdit,
  IconPlus,
  IconRestore,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ManageSoldiers() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [editingSoldier, setEditingSoldier] = useState<Soldier | null>(null);
  const [newSoldier, setNewSoldier] = useState({
    name: "",
    email: "",
    phone: "",
    rank: "",
    profileImage: "",
    serviceNumber: "",
    unit: "",
    dateOfEnlistment: new Date(),
  });
  const [image, setImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSoldiers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/soldiers");
      if (!response.ok) throw new Error("Failed to fetch soldiers");
      const data = await response.json();
      setSoldiers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoldiers();
  }, []);

  const UploadImage = (folderName: string, imageName: string, path: string) => {
    if (!newSoldier.name) {
      toast.error("Name is required for images");
      return;
    }
    if (image) {
      if (image.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB");
        return;
      }
      const imageResponse = axios.postForm("/api/helper/upload-img", {
        file: image,
        name: imageName,
        folderName: folderName,
      });
      console.log(imageResponse);
      toast.promise(imageResponse, {
        loading: "Uploading Image...",
        success: (data: AxiosResponse) => {
          setNewSoldier({
            ...newSoldier,
            [path]: data.data.path,
          });
          return "Image Uploaded Successfully";
        },
        error: (err: unknown) => `This just happened: ${err}`,
      });
    }
  };

  const filteredSoldiers = soldiers.filter((soldier) => {
    const term = searchTerm.toLowerCase();
    return (
      soldier.name.toLowerCase().includes(term) ||
      soldier.rank.toLowerCase().includes(term) ||
      soldier.unit.toString().includes(term)
    );
  });

  const handleAddSoldier = async () => {
    if (
      !newSoldier.name ||
      !newSoldier.email ||
      !newSoldier.phone ||
      !newSoldier.rank ||
      !newSoldier.unit ||
      !newSoldier.serviceNumber ||
      !newSoldier.profileImage
    ) {
      toast.error(
        `Please fill all the required fields. Remaining fields: ${
          !newSoldier.name ? " Name," : ""
        }${!newSoldier.email ? " Email," : ""}${
          !newSoldier.phone ? " Phone," : ""
        }${!newSoldier.rank ? " Rank," : ""}${
          !newSoldier.unit ? " Unit," : ""
        }${!newSoldier.serviceNumber ? " Service Number," : ""}${
          !newSoldier.profileImage ? " Profile Image" : ""
        }`,
      );
      return;
    }
    try {
      const res = axios.post("/api/soldiers/add-soldier", { newSoldier });
      toast.promise(res, {
        loading: "Adding Soldier...",
        success: () => {
          (
            document.getElementById("add-soldier-modal") as HTMLDialogElement
          ).close();
          fetchSoldiers();
          return "Soldier Added Successfully";
        },
        error: "Failed to add soldier",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to add soldier");
    }
  };

  const handleUpdateSoldier = async () => {
    if (!editingSoldier) return;

    try {
      const res = axios.put("/api/soldiers/update", editingSoldier);

      toast.promise(res, {
        loading: "Updating Soldier...",
        success: () => {
          (
            document.getElementById("edit-soldier-modal") as HTMLDialogElement
          ).close();
          fetchSoldiers();
          return "Soldier Updated Successfully";
        },
        error: "Failed to update soldier",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to update soldier");
    }
  };

  const deleteSoldier = async (id: string) => {
    if (!confirm("Are you sure you want to delete this soldier?")) return;
    try {
      const res = axios.delete(`/api/soldiers/delete?id=${id}`);
      toast.promise(res, {
        loading: "Deleting Soldier...",
        success: () => {
          fetchSoldiers();
          return "Soldier Deleted Successfully";
        },
        error: "Failed to delete soldier",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete soldier");
    }
  };
  if (loading) return <Loading />;

  return (
    <>
      <Title title="Manage Soldiers" subtitle="View and manage soldiers" />
      <div className="flex flex-row gap-6 max-w-7xl mx-auto mb-6">
        <label
          htmlFor=""
          className="input input-primary input-bordered w-full mb-4"
        >
          <IconSearch size={16} />
          <input
            className="grow"
            type="text"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search soldiers by name, rank, or unit"
          />
        </label>
        <button
          className="btn btn-primary"
          onClick={() =>
            (
              document.getElementById("add-soldier-modal") as HTMLDialogElement
            ).showModal()
          }
        >
          + Add Soldier
        </button>
      </div>

      <div className="overflow-x-auto max-w-7xl mx-auto bg-base-300 p-4 rounded-lg">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Service Number</th>
              <th>Name</th>
              <th>Rank</th>
              <th>Unit</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSoldiers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-lg">
                  No soldiers found
                </td>
              </tr>
            ) : (
              filteredSoldiers.map((soldier, index) => (
                <tr key={soldier._id}>
                  <td>{index + 1}</td>
                  <td>{soldier.serviceNumber}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img src={soldier.profileImage} alt={soldier.name} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{soldier.name}</div>
                        <div className="text-sm opacity-50">{soldier.rank}</div>
                      </div>
                    </div>
                  </td>
                  <td>{soldier.rank}</td>
                  <td>{soldier.unit}</td>
                  <td>{soldier.phone}</td>
                  <td className="space-x-3">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingSoldier(soldier);
                        (
                          document.getElementById(
                            "edit-soldier-modal",
                          ) as HTMLDialogElement
                        ).showModal();
                      }}
                    >
                      <IconEdit size={16} className="mr-2" />
                      Edit
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={() => deleteSoldier(soldier._id!)}
                    >
                      <IconTrash size={16} className="mr-2" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <dialog
        id="add-soldier-modal"
        className="modal bg-base-100/70 backdrop-blur-lg opacity-100"
      >
        <Toaster />
        <div className="modal-box w-11/12 max-w-3xl bg-base-100">
          <h3 className="font-bold text-2xl text-primary text-center py-2">
            Add New Soldier
          </h3>
          <div className="px-10 py-5 mx-auto bg-base-200 rounded-lg">
            <h1 className="border-b text-lg font-bold mb-4">Soldier Details</h1>
            <div className="grid grid-cols-2 gap-4 my-4">
              {/* Soldier Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Soldier Name <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Soldier name"
                  value={newSoldier.name}
                  onChange={(e) =>
                    setNewSoldier({
                      ...newSoldier,
                      name: e.target.value,
                    })
                  }
                />
              </fieldset>
              {/* Soldier Email */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Soldier Email <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Soldier email"
                  value={newSoldier.email}
                  onChange={(e) =>
                    setNewSoldier({
                      ...newSoldier,
                      email: e.target.value.toLowerCase().trim() || "",
                    })
                  }
                />
              </fieldset>
              {/* Soldier Phone */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Soldier Phone <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Soldier phone"
                  value={newSoldier.phone}
                  onChange={(e) =>
                    setNewSoldier({
                      ...newSoldier,
                      phone: e.target.value,
                    })
                  }
                />
              </fieldset>
              {/* Soldier Rank */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Soldier Rank <span className="text-error">*</span>{" "}
                </legend>
                <select
                  name="rank"
                  className="select select-bordered w-full"
                  value={newSoldier.rank}
                  onChange={(e) =>
                    setNewSoldier({ ...newSoldier, rank: e.target.value })
                  }
                >
                  <option defaultChecked value="">
                    Select Rank
                  </option>
                  <option value="Private">Private</option>
                  <option value="Corporal">Corporal</option>
                  <option value="Sergeant">Sergeant</option>
                  <option value="Lieutenant">Lieutenant</option>
                  <option value="Captain">Captain</option>
                  <option value="Major">Major</option>
                  <option value="Colonel">Colonel</option>
                  <option value="General">General</option>
                </select>
              </fieldset>
              {/* Soldier Unit */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Soldier Unit <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Soldier unit"
                  value={newSoldier.unit}
                  onChange={(e) =>
                    setNewSoldier({
                      ...newSoldier,
                      unit:
                        e.target.value.charAt(0).toUpperCase() +
                        e.target.value.slice(1),
                    })
                  }
                />
              </fieldset>
              {/* Soldier Service Number */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Soldier Service Number{" "}
                  <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter the Soldier service number"
                  value={newSoldier.serviceNumber}
                  onChange={(e) =>
                    setNewSoldier({
                      ...newSoldier,
                      serviceNumber: e.target.value,
                    })
                  }
                />
              </fieldset>
              {/* Soldier Date of Enlistment */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Date of Enlistment <span className="text-error">*</span>{" "}
                </legend>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  max={new Date().toISOString()}
                  value={
                    newSoldier.dateOfEnlistment.toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setNewSoldier({
                      ...newSoldier,
                      dateOfEnlistment: new Date(e.target.value),
                    })
                  }
                />
              </fieldset>
            </div>

            {/* Event Image */}
            <fieldset className="fieldset mt-2">
              <legend className="fieldset-legend">
                Soldier Image <span className="text-error">*</span>{" "}
              </legend>
              <div className="join">
                <input
                  type="file"
                  disabled={newSoldier.name ? false : true}
                  className="file-input file-input-bordered w-full join-item"
                  accept="image/jpg, image/jpeg, image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImage(file);
                    }
                  }}
                />
                <button
                  className="btn btn-primary join-item"
                  onClick={() =>
                    UploadImage("soldiers", newSoldier.name, "profileImage")
                  }
                >
                  <IconCloudUpload size={20} className="mr-2" />
                  Upload
                </button>
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-4 my-4"></div>
          </div>
          <div className="flex mt-6 justify-center gap-4">
            <button
              className="btn btn-error btn-outline mx-auto"
              onClick={() => window.location.reload()}
            >
              <IconRestore size={16} className="mr-2" />
              Reset
            </button>
            <button
              className="btn btn-primary mx-auto"
              onClick={handleAddSoldier}
            >
              <IconPlus size={16} className="mr-2" />
              Submit
            </button>
            <button
              className="btn btn-secondary mx-auto"
              onClick={() => {
                (
                  document.getElementById(
                    "add-Soldier-modal",
                  ) as HTMLDialogElement
                ).close();
              }}
            >
              <IconCancel size={16} className="mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </dialog>
      <dialog
        id="edit-soldier-modal"
        className="modal bg-base-100/70 backdrop-blur-lg opacity-100"
      >
        <Toaster />
        <div className="modal-box w-11/12 max-w-3xl bg-base-100">
          <h3 className="font-bold text-2xl text-primary text-center py-2">
            Edit Soldier
          </h3>

          {editingSoldier && (
            <div className="px-10 py-5 mx-auto bg-base-200 rounded-lg">
              <h1 className="border-b text-lg font-bold mb-4">
                Soldier Details
              </h1>
              <div className="grid grid-cols-2 gap-4 my-4">
                {/* Soldier Name */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Soldier Name <span className="text-error">*</span>{" "}
                  </legend>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter the Soldier name"
                    value={editingSoldier?.name}
                    onChange={(e) =>
                      setEditingSoldier({
                        ...editingSoldier!,
                        name: e.target.value,
                      })
                    }
                  />
                </fieldset>
                {/* Soldier Email */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Soldier Email <span className="text-error">*</span>{" "}
                  </legend>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter the Soldier email"
                    value={editingSoldier?.email}
                    disabled
                    readOnly
                  />
                </fieldset>
                {/* Soldier Phone */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Soldier Phone <span className="text-error">*</span>{" "}
                  </legend>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter the Soldier phone"
                    value={editingSoldier?.phone}
                    onChange={(e) =>
                      setEditingSoldier({
                        ...editingSoldier!,
                        phone:
                          e.target.value.length <= 10
                            ? e.target.value
                            : editingSoldier!.phone,
                      })
                    }
                  />
                </fieldset>
                {/* Soldier Rank */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Soldier Rank <span className="text-error">*</span>{" "}
                  </legend>
                  <select
                    name="rank"
                    className="select select-bordered w-full"
                    value={editingSoldier?.rank}
                    onChange={(e) =>
                      setEditingSoldier({
                        ...editingSoldier!,
                        rank: e.target.value,
                      })
                    }
                  >
                    <option defaultChecked value="">
                      Select Rank
                    </option>
                    <option value="Private">Private</option>
                    <option value="Corporal">Corporal</option>
                    <option value="Sergeant">Sergeant</option>
                    <option value="Lieutenant">Lieutenant</option>
                    <option value="Captain">Captain</option>
                    <option value="Major">Major</option>
                    <option value="Colonel">Colonel</option>
                    <option value="General">General</option>
                  </select>
                </fieldset>
                {/* Soldier Unit */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Soldier Unit <span className="text-error">*</span>{" "}
                  </legend>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter the Soldier unit"
                    value={editingSoldier?.unit}
                    onChange={(e) =>
                      setEditingSoldier({
                        ...editingSoldier!,
                        unit:
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1),
                      })
                    }
                  />
                </fieldset>
                {/* Soldier Service Number */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">
                    Soldier Service Number{" "}
                    <span className="text-error">*</span>{" "}
                  </legend>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter the Soldier service number"
                    value={editingSoldier?.serviceNumber}
                    readOnly
                    disabled
                  />
                </fieldset>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-6">
            <button className="btn btn-primary" onClick={handleUpdateSoldier}>
              Save Changes
            </button>

            <button
              className="btn btn-error btn-outline"
              onClick={() =>
                (
                  document.getElementById(
                    "edit-soldier-modal",
                  ) as HTMLDialogElement
                ).close()
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
