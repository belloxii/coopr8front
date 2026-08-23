const uploadToCloud = async (pics) => {
    if (pics) {
        const data = new FormData();
        data.append("file", pics);
        data.append("upload_preset", "tazmskpg");
        data.append("cloud_name", "ddyzfnmnk");

        try {
            const res = await fetch(
                "https://api.cloudinary.com/v1_1/ddyzfnmnk/image/upload", 
                { method: "POST", body: data }
            );
            const fileData = await res.json();
            return fileData.url.toString();
        } catch (error) {
            console.error("Upload failed:", error);
        }
    } else {
        console.log("No file to upload");
    }
};
export default uploadToCloud
