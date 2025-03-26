import React, { useState } from 'react';
// Import MUI components for creating a dialog interface
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// complete the code.
// instructor adds an assignment to a section ✅
// use mui Dialog with assignment fields Title and DueDate ✅
// issue a POST using URL /assignments to add the assignment ✅

/**
 * Component: AssignmentAdd
 * Purpose: Allows an instructor to add an assignment to a section using a popup dialog
 * Props:
 *  - save: a function passed via props to handle saving the new assignment (e.g., making a POST request)
 */

const AssignmentAdd = (props) => {
    // State to control whether the dialog is open or not
    const [open, setOpen] = useState(false);

    // State to hold any error or validation message to show in the dialog
    const [editMessage, setEditMessage] = useState('');

    // State to store the new assignment's title and due date
    // sls/hp
    const [assignment, setAssignment] = useState({ title: '', dueDate: '', courseId:'', secId:'', secNo:'' });

    // Opens the dialog and clears any previous error messages
    const editOpen = () => {
        setOpen(true);
        setEditMessage('');
    };

    // Closes the dialog and resets the assignment form fields and messages
    // sls/hp
    const editClose = () => {
        setOpen(false);
        setAssignment({ title: '', dueDate: '', courseId:'', secId:'', secNo:'' }); // reset fields
        setEditMessage(''); // reset error message
    };

    // Updates the assignment state when user types in either input field
    const editChange = (event) => {
        setAssignment({
            ...assignment,
            [event.target.name]: event.target.value // dynamically update title or dueDate
        });
    };

    // Validates input and calls the save function passed via props
    const onSave = () => {
        if (assignment.title === '') {
            setEditMessage("Title cannot be blank");
        } else if (assignment.dueDate === '') {
            setEditMessage("Due date cannot be blank");
        } else {
            props.save(assignment); // pass assignment to parent component
            editClose(); // close dialog after save
        }
    };

    return (
        <>
            {/* Button to trigger the dialog */}
            <Button variant="contained" color="primary" onClick={editOpen}>
                Add Assignment
            </Button>

            {/* Dialog component for input form */}
            <Dialog open={open}>
                <DialogTitle>Add Assignment</DialogTitle>
                <DialogContent style={{ paddingTop: 20 }}>
                    {/* Display validation or error message in red */}
                    <h4 style={{ color: 'red' }}>{editMessage}</h4>

                    {/* Text field for assignment title */}
                    <TextField
                        style={{ padding: 10 }}
                        autoFocus
                        fullWidth
                        label="Title"
                        name="title"
                        value={assignment.title}
                        onChange={editChange}
                    />

                    {/* Text field for due date */}
                    <TextField
                        style={{ padding: 10 }}
                        fullWidth
                        label="Due Date (YYYY-MM-DD)"
                        name="dueDate"
                        value={assignment.dueDate}
                        onChange={editChange}
                        placeholder="YYYY-MM-DD"
                    />
                </DialogContent>

                {/* Action buttons for cancel and save */}
                <DialogActions>
                    <Button color="secondary" onClick={editClose}>Cancel</Button>
                    <Button color="primary" onClick={onSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AssignmentAdd;
