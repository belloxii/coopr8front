import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import uploadToCloud from '../../../../../Utils/uploadToCloud';
import { adminUpdateUser, findUserById } from '../../../../../Store/Admin/Action';

const genderOptions = ['Male', 'Female', 'Other'];
const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const roleOptions = ['ROLE_MEMBER', 'ROLE_ADMIN'];
const statusOptions = ['NEW', 'PENDING', 'ACTIVE', 'SUSPENDED'];
const paymentTypeOptions = ['GOVERNMENT', 'SELF_PAY'];

/**
 * Administrative edit of one member of the administrator's own cooperative.
 *
 * This posts to `PUT /api/admin/user/update`, which is a different endpoint from the member's own
 * profile save. It previously dispatched the self-service `updateUser`, which ignores any id in the
 * body and edits whoever is holding the token -- so an administrator editing a member was silently
 * editing their own profile instead, and none of the privileged fields below could be set at all.
 *
 * `userId` is what identifies the member. The cooperative is not sent and could not be: the backend
 * resolves the member inside the administrator's own organization and answers 404 for anyone else.
 */
const EDITABLE_TEXT_FIELDS = [
  ['First Name', 'firstName'],
  ['Middle Name', 'middleName'],
  ['Last Name', 'lastName'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Address', 'address'],
  ['Home Town', 'homeTown'],
  ['State', 'state'],
  ['LGA', 'lga'],
  ['Station', 'station'],
  ['PSN', 'psn'],
  ['Occupation', 'occupation'],
  ['Verification Number', 'verNo'],
  ['Next of Kin', 'nextOfKin'],
  ['Next of Kin Relationship', 'nextOfKinRelationship'],
  ['Next of Kin Address', 'nextOfKinAddress'],
  ['Next of Kin Phone', 'nextOfKinPhone'],
];

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'address'];

const PLAN_FIELDS = [
  ['Monthly Saving Plan', 'savingPlan'],
  ['Special Saving Plan', 'specialSavingPlan'],
  ['Share Plan', 'sharePlan'],
];

const EditProfileModal = ({ open, handleClose, userId }) => {
  const dispatch = useDispatch();
  const { findUser } = useSelector((store) => store.admin);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId && open) {
      dispatch(findUserById(userId));
    }
  }, [userId, open, dispatch]);

  useEffect(() => {
    if (findUser) {
      setFormData({ ...findUser });
    }
  }, [findUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (event) => {
    setUploading(true);
    const file = await uploadToCloud(event.target.files[0]);
    setFormData((prev) => ({ ...prev, passport: file }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Built from the allowed list rather than spread from the loaded member, so the request
    // carries the administrative field set and nothing else -- no balances, no ledgerID, no
    // password, whatever the loaded object happens to contain.
    const payload = {
      userId: findUser?.id ?? userId,
      passport: formData.passport,
    };

    [...EDITABLE_TEXT_FIELDS.map(([, name]) => name), 'gender', 'marital'].forEach((name) => {
      payload[name] = formData[name] ?? '';
    });
    ['role', 'status', 'paymentType'].forEach((name) => {
      if (formData[name]) {
        payload[name] = formData[name];
      }
    });
    PLAN_FIELDS.forEach(([, name]) => {
      const value = formData[name];
      if (value !== '' && value !== null && value !== undefined) {
        payload[name] = Number(value);
      }
    });

    try {
      await dispatch(adminUpdateUser(payload));
      handleClose();
    } catch (submitError) {
      // Most likely the cooperative refusing the change -- an administrator editing their own
      // role or status, for instance, which the backend rejects on purpose.
      setError(
        submitError?.response?.data?.message ||
          submitError?.response?.data?.responseMessage ||
          'The change was not saved.'
      );
    }
  };

  if (!formData || Object.keys(formData).length === 0) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <p>Loading user data...</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Profile
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: '75vh' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar
                src={formData.passport || ''}
                sx={{ width: 100, height: 100, border: '4px solid white' }}
              />
              <input
                type="file"
                accept="image/*"
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>
            {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
          </div>

          {/* The membership number is the login identifier and appears on ledgers and
              passbooks -- issued once, never rewritten, so it is shown but not editable. */}
          <div className="mb-4">
            <TextField
              label="Membership Number"
              value={formData.ledgerID || '—'}
              fullWidth
              InputProps={{ readOnly: true }}
              variant="filled"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EDITABLE_TEXT_FIELDS.map(([label, name]) => (
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
              {genderOptions.map((option) => (
                <MenuItem key={option} value={option.toLowerCase()}>
                  {option}
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
              {maritalOptions.map((option) => (
                <MenuItem key={option} value={option.toLowerCase()}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            {PLAN_FIELDS.map(([label, name]) => (
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

          {/* Privileged. Only this endpoint can set them, and only for a member of this
              cooperative. An administrator cannot change their own role or status here --
              the backend refuses, so that one compromised admin session cannot suspend the
              others and keep the cooperative to itself. */}
          <p className="text-sm text-muted-foreground mt-6 mb-2">
            Membership and access — administrator only.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              select
              label="Role"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              fullWidth
            >
              {roleOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'ROLE_ADMIN' ? 'Administrator' : 'Member'}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleChange}
              fullWidth
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Payment Type"
              name="paymentType"
              value={formData.paymentType || ''}
              onChange={handleChange}
              fullWidth
            >
              {paymentTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 'GOVERNMENT' ? 'Salary deduction' : 'Self pay'}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save Changes</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileModal;
