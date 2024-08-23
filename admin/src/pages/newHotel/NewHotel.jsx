import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { hotelInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const NewHotel = () => {
  const [files, setFiles] = useState([]);
  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data, loading: roomsLoading } = useFetch("/rooms");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setRooms(value);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const list = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "upload");
          const uploadRes = await axios.post(
            "https://api.cloudinary.com/v1_1/de0pousaf/image/upload",
            data
          );

          return uploadRes.data.url;
        })
      );

      const newHotel = {
        ...info,
        rooms,
        photos: list,
      };

      await axios.post("/hotels", newHotel);
      navigate("/hotels"); // Redirect after successful upload
    } catch (err) {
      console.error(err);
      setError("Failed to create hotel. Please try again.");
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
          <h1>Add New Hotel</h1>
        </div>
        <div className="bottom">
          <div className="left">
            {files.length > 0 ? (
              files.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt=""
                />
              ))
            ) : (
              <img
                src="https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                alt=""
              />
            )}
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
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  style={{ display: "none" }}
                />
              </div>

              {hotelInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Featured</label>
                <select id="featured" onChange={handleChange}>
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>
              <div className="selectRooms">
                <label>Rooms</label>
                <select id="rooms" multiple onChange={handleSelect}>
                  {roomsLoading
                    ? "loading"
                    : data &&
                      data.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.title}
                        </option>
                      ))}
                </select>
              </div>
              <button onClick={handleClick} disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </button>
              {error && <p className="error">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHotel;
