export function checkFileType(file: File) {
    if (file?.name) {
        const fileType = file.name.split(".").pop();
        if (fileType === "jpeg"
            || fileType === "jpg"
            || fileType === "png"
            || fileType === "gif")
            return true;
        return false;
    }
}