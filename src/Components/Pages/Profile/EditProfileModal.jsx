import { useEffect, useState } from 'react';
import {
  Box, Button, Modal, Avatar, IconButton,
  TextField, MenuItem, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../../Store/User/Action';
import uploadToCloud from '../../../Utils/uploadToCloud';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 6,
  boxShadow: 24,
  p: 4,
  outline: 'none',
};

const genderOptions = ['Male', 'Female', 'Other'];
const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];

/**
 * The exact field set a member may change about themselves.
 *
 * This mirrors the backend's UserProfileUpdateRequest. Anything not on this list -- role, status,
 * membership number, PSN, cooperative, password, and every balance -- is either an administrator's
 * to set or the ledger's to calculate.
 *
 * The list is used to *build* the request rather than to filter the form, which is the important
 * part: the previous version sent `{...findUser}`, the whole entity as the API had returned it, so
 * anything the member could get into that object was submitted. The backend refuses the privileged
 * fields regardless -- it binds to the DTO, not the entity -- but a form that only ever sends what
 * it is allowed to send cannot be the thing that has to be trusted.
 */
const EDITABLE_TEXT_FIELDS = [
  ['firstName', 'First Name'],
  ['middleName', 'Middle Name'],
  ['lastName', 'Last Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['address', 'Address'],
  ['homeTown', 'Home Town'],
  ['state', 'State'],
  ['lga', 'LGA'],
  ['station', 'Station'],
  ['occupation', 'Occupation'],
  ['nextOfKin', 'Next of Kin'],
  ['nextOfKinRelationship', 'Next of Kin Relationship'],
  ['nextOfKinAddress', 'Next of Kin Address'],
  ['nextOfKinPhone', 'Next of Kin Phone'],
];

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'address'];

/** Contribution amounts: numbers, and part of the same self-service DTO. */
const PLAN_FIELDS = [
  ['savingPlan', 'Monthly Saving Plan'],
  ['specialSavingPlan', 'Special Saving Plan'],
  ['sharePlan', 'Share Plan'],
];

/** Shown so the member can read and quote them, but not theirs to change. */
const READ_ONLY_FIELDS = [
  ['ledgerID', 'Membership Number'],
  ['role', 'Role'],
  ['psn', 'PSN'],
];

const EditProfileModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const { findUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (findUser) {
      setFormData({ ...findUser });
    }
  }, [findUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const uploadedUrl = await uploadToCloud(file);
    setFormData((prev) => ({ ...prev, passport: uploadedUrl }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Built key by key from the allowed list, not spread from the loaded member.
    const payload = { passport: formData.passport };

    EDITABLE_TEXT_FIELDS.forEach(([name]) => {
      payload[name] = formData[name] ?? '';
    });
    ['gender', 'marital'].forEach((name) => {
      payload[name] = formData[name] ?? '';
    });
    PLAN_FIELDS.forEach(([name]) => {
      // An empty box means "leave it alone", not "set it to zero".
      const value = formData[name];
      if (value !== '' && value !== null && value !== undefined) {
        payload[name] = Number(value);
      }
    });

    dispatch(updateUser(payload));
    handleClose();
  };

  if (!findUser) {
    return (
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle} className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
              <h2 className="text-xl font-semibold">Edit Profile</h2>
            </div>
            <Button variant="contained" type="submit" sx={{ textTransform: 'none' }}>
              Save Changes
            </Button>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar
                src={formData.passport}
                sx={{ width: 100, height: 100, border: '4px solid #fff' }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {uploading && <p className="text-sm mt-2 text-muted-foreground">Uploading...</p>}
          </div>

          {/* Your details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EDITABLE_TEXT_FIELDS.map(([name, label]) => (
              <TextField
                key={name}
                label={label}
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                fullWidth
                required={REQUIRED_FIELDS.includes(name)}
              />
            ))}

            <TextField
              select
              label="Gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              fullWidth
              required
            >
              {genderOptions.map((opt) => (
                <MenuItem key={opt} value={opt.toLowerCase()}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Marital Status"
              name="marital"
              value={formData.marital || ''}
              onChange={handleChange}
              fullWidth
            >
              {maritalOptions.map((opt) => (
                <MenuItem key={opt} value={opt.toLowerCase()}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            {PLAN_FIELDS.map(([name, label]) => (
              <TextField
                key={name}
                label={label}
                name={name}
                type="number"
                value={formData[name] ?? ''}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
              />
            ))}
          </div>

          {/* Set by your cooperative. Balances are not here at all: they are the ledger's
              record of what has actually been paid, and a profile form must not be able to
              restate them. */}
          <p className="text-sm text-muted-foreground mt-6 mb-2">
            Set by your cooperative — contact an administrator to change these.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {READ_ONLY_FIELDS.map(([name, label]) => (
              <TextField
                key={name}
                label={label}
                value={formData[name] || '—'}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="filled"
              />
            ))}
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default EditProfileModal;
