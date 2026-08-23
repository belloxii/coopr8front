import { useState } from 'react'
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import VerifiedIcon from '@mui/icons-material/Verified';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: 'none',
  boxShadow: 24,
  p: 4,
  borderRadius: 6,
  outline: "none"
};

const features = [
    "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    "Impedit vero consequuntur tempora aspernatur.",
    "necessitatibus possimus repellat.",
    "voluptatem ea earum neque exercitationem.",
    "dolorum distinctio maxime veniam blanditiis.",
    "minima porro voluptates labore?"
]

const VerifyModal = ({open, handleClose}) => {

    const [plan, setPlan] = useState.apply("Annually");

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
            <div className="flex items-center space-x-3">
                <IconButton onClick={handleClose} aria-label='delete'>
                    <CloseIcon/>
                </IconButton>
            </div>

            <div className="flex justify-center py-3">
                <div className='w-[80%] space-y-7'>
                    <div className="p-5 rounded-xl flex items-center justify-between shadow-lg bg-black">
                        <h1 className='text-lg text-white pr-5'>Blue subscribers with a verified phone number will get a blue tick when approved</h1>
                        <VerifiedIcon sx={{width:"7rem", height:"7rem"}} className='text-blue-500' />
                    </div>
                    <div className='flex justify-between border border-gray-500 rounded-full px-5 py-1'>
                        <div>
                            <span onClick={() => setPlan("Annually")} className={`${plan==="Annually" ? "text-blue-500 font-bold" : "text-muted-foreground"} cursor-pointer`}>Annually</span>
                            <span className='text-green-500 text-sm ml-5'>SAVE 12%</span>
                        </div>
                        <p onClick={() => setPlan("monthly")} className={`${plan==="monthly" ? "text-blue-500 font-bold" : "text-muted-foreground"} cursor-pointer`}>Monthly</p>
                    </div>

                    <div className='space-y-3'>
                        {features.map((item) => <div className='flex items-center space-x-5'>
                            <FiberManualRecordIcon sx={{width:"10px", height:"10px"}} />
                            <p>{item}</p>
                        </div>)}
                    </div>

                    <div className='cursor-pointer flex justify-center bg-gray-800 text-white rounded-full px-5 py-3'>
                        <span className='line-through italic'>₦125,0000</span>
                        <span className='px-5'>₦85,0000/year</span>
                    </div>
                </div>
            </div>
        </Box>

      </Modal>
    </div>
  );
}

export default VerifyModal