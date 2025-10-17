import React, { useState, useContext } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddDoctor = () => {
  const [preview, setPreview] = useState(assets.upload_area);
  const [docImg, setDocImg] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General Physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

    // resets the form
  const resetForm = () => {
    setDocImg(null);
    setPreview(assets.upload_area);
    setName("");
    setEmail("");
    setPassword("");
    setExperience("1 Year");
    setFees("");
    setAbout("");
    setSpeciality("General Physician");
    setDegree("");
    setAddress1("");
    setAddress2("");
  };

  const { backendUrl, aToken } = useContext(AdminContext);

  // 🔹 Handle image preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocImg(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🔹 Submit handler
  const onSubmitHandler = async (event) => {
    event.preventDefault(); // 🚫 Prevent normal form submission

    if (!docImg) {
      toast.error("Please select an image first!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", fees);
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append("address", JSON.stringify({ address1, address2 }));
      formData.append("image", docImg);

      
      const {data} = await axios.post(
        `${backendUrl}/api/admin/add-doctor`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${aToken}`
           
          },
        }
      );

      if (data.success) {
        toast.success("Doctor added successfully!");
        resetForm();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error addding doctor", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
      toast.error("An error occurred while adding the doctor");
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="w-full flex justify-center p-6"
      encType="multipart/form-data" // ✅ Important for file uploads
    >
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">Add Doctor</h1>

        {/* Upload Section */}
        <div className="flex items-center gap-5 mb-10">
          <label htmlFor="doc-img" className="cursor-pointer relative group">
            <img
              src={preview}
              alt="Doctor"
              className="w-20 h-20 rounded-full object-cover border border-gray-300 group-hover:border-indigo-400 transition-all"
            />
            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-10 transition" />
          </label>
          <input type="file" id="doc-img" hidden onChange={handleImageUpload} />
          <div>
            <p className="font-medium text-gray-700">Upload Doctor Picture</p>
            <p className="text-gray-400 text-sm">JPG, PNG up to 2MB</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left */}
          <div className="flex flex-col gap-6">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Doe" />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="janedoe@email.com" />
            <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter password" />
            <Select label="Experience" value={experience} onChange={(e) => setExperience(e.target.value)} options={["1 Year","2 Years","3 Years","4 Years","5 Years","6 Years","7 Years","8 Years","9 Years","10 Years"]} />
            <Input label="Consultation Fee" value={fees} onChange={(e) => setFees(e.target.value)} type="number" placeholder="5000" />
          </div>

          {/* Right */}
          <div className="flex flex-col gap-6">
            <Select
              label="Speciality"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              options={[
                "General Physician",
                "Gynecologist",
                "Dermatologist",
                "Pediatrician",
                "Neurologist",
                "Gastroenterologist",
              ]}
            />
            <Input
              label="Education"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="MBBS, MD"
            />
            <div className="flex flex-col gap-3">
              <Label text="Address" />
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                className="input"
                type="text"
                placeholder="Address line 1"
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                className="input"
                type="text"
                placeholder="Address line 2"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
  <Label text="About Doctor" />
  <div className="relative">
    <textarea
      onChange={(e) => setAbout(e.target.value)}
      value={about}
      className="
        w-full border border-gray-300 rounded-lg px-3.5 py-3 
        text-gray-700 placeholder:text-gray-400 bg-gray-50
        focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
        outline-none transition-all duration-200 resize-none min-h-[140px] leading-relaxed
      "
      placeholder="Brief biography, area of specialization, or patient care philosophy..."
      rows={5}
    />
    <span className="absolute bottom-2 right-3 text-xs text-gray-400">
      {about.length}/500
    </span>
  </div>
</div>

        {/* Submit Button */}
        <div className="mt-10 flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200"
          >
            Add Doctor
          </button>
        </div>
      </div>
    </form>
  );
};

/* --- Reusable Components --- */
const Input = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <Label text={label} />
    <input
      type={type}
      placeholder={placeholder}
      className="modern-input"
      value={value || ""}
      onChange={onChange}
      required
    />
  </div>
);
const Select = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <Label text={label} />
    <select
      className="modern-input bg-white cursor-pointer"
      value={value}
      onChange={onChange}
      required
    >
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
const Label = ({ text }) => (
  <label className="text-sm font-semibold text-gray-700 tracking-wide">
    {text}
  </label>
);
export default AddDoctor;
