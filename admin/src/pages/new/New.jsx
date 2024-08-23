import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import axios from "axios";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please upload an image.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "upload");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/de0pousaf/image/upload",
        data
      );

      const { url } = uploadRes.data;

      const newUser = {
        ...info,
        img: url,
      };

      await axios.post("/auth/register", newUser);
      setSuccess("User registered successfully!");
      setInfo({});
      setFile(null);
      setTimeout(() => setSuccess(""), 5000); // Clear success message after 5 seconds
    } catch (err) {
      console.error(err);
      setError("Failed to register user. Please try again.");
      setTimeout(() => setError(""), 5000); // Clear error message after 5 seconds
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="Preview"
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  accept="image/*"
                  aria-label="Upload Image"
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                    id={input.id}
                    value={info[input.id] || ""}
                    required // Add required attribute for validation
                  />
                </div>
              ))}
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
              <button onClick={handleClick} disabled={loading}>
                {loading ? "Uploading..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
