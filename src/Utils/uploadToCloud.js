// Direct browser uploads are intentionally disabled: an unsigned preset would let anyone use
// the platform's media account. Use the authenticated backend upload flow instead.
const uploadToCloud = async () => {
    throw new Error("Direct image uploads are disabled. Use the server upload endpoint.");
};
export default uploadToCloud
