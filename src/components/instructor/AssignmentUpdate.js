import React, { useState } from 'react';
// MUI components used to build the modal dialog UI
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';

//  instructor updates assignment title, dueDate ✅
//  use an mui Dialog ✅
//  issue PUT to URL  /assignments with updated assignment ✅

/**
 * AssignmentUpdate component
 *
 * This component allows an instructor to update an assignment's title and due date.
 * It displays a dialog with form fields and validation.
 *
 * Props:
 * - assignment: Object representing the current assignment (with fields like id, title, dueDate, courseId, secId, secNo)
 * - save: Function to call with updated assignment data when saving
 */
const AssignmentUpdate = (props) => {
    // State to control whether the dialog is open
    const [open, setOpen] = useState(false);

    // State to store error/validation messages shown in red
    const [editMessage, setEditMessage] = useState('');

    // State to track the editable assignment fields (initialized from props)
    const [assignment, setAssignment] = useState({
        id: props.assignment.id,
        title: props.assignment.title,
        dueDate: props.assignment.dueDate,
        courseId: props.assignment.courseId || "",  // Fallback to empty string if not provided
        secId: props.assignment.secId || 0,         // Fallback to 0 if not provided
        secNo: props.assignment.secNo
    });

    // Opens the dialog and refreshes assignment state with latest props
    const editOpen = () => {
        setAssignment({
            id: props.assignment.id,
            title: props.assignment.title,
            dueDate: props.assignment.dueDate,
            courseId: props.assignment.courseId || "",
            secId: props.assignment.secId || 0,
            secNo: props.assignment.secNo
        });
        setOpen(true); // show dialog
        setEditMessage(''); // reset any validation message
    };

    // Closes the dialog and clears any validation messages
    const editClose = () => {
        setOpen(false); // hide dialog
        setEditMessage('');
    };

    // Handles changes in form inputs by updating assignment state
    const editChange = (event) => {
        setAssignment({
            ...assignment,
            [event.target.name]: event.target.value // dynamically update changed field
        });
    };

    // Validates that the date is in the format YYYY-MM-DD and represents a valid date
    const validateDate = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/; // Regex for YYYY-MM-DD
        if (!regex.test(dateString)) return false;

        // Attempt to parse date to ensure it's valid
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    };

    // Runs validations and triggers save function if inputs are valid
    const onSave = () => {
        if (assignment.title.trim() === '') {
            setEditMessage("Title cannot be blank");
        } else if (assignment.dueDate.trim() === '') {
            setEditMessage("Due date cannot be blank");
        } else if (!validateDate(assignment.dueDate)) {
            setEditMessage("Due date must be in format YYYY-MM-DD");
        } else {
            props.save(assignment); // Call save function passed from parent
            editClose(); // Close dialog
        }
    };

    return (
        <>
            {/* Button to open the Edit Assignment dialog */}
            <Button variant="outlined" color="primary" onClick={editOpen}>
                Edit
            </Button>

            {/* Dialog UI for updating the assignment */}
            <Dialog open={open}>
                <DialogTitle>Update Assignment</DialogTitle>
                <DialogContent style={{ paddingTop: 20 }}>
                    {/* Show validation message in red if present */}
                    {editMessage && <p style={{ color: 'red', margin: '5px 0' }}>{editMessage}</p>}

                    {/* Input field for assignment title */}
                    <TextField
                        style={{ padding: 10 }}
                        autoFocus
                        fullWidth
                        label="Title"
                        name="title"
                        value={assignment.title}
                        onChange={editChange}
                        error={assignment.title.trim() === ''}
                        helperText={assignment.title.trim() === '' ? "Title is required" : ""}
                    />

                    {/* Input field for assignment due date */}
                    <TextField
                        style={{ padding: 10 }}
                        fullWidth
                        label="Due Date"
                        name="dueDate"
                        value={assignment.dueDate}
                        onChange={editChange}
                        placeholder="YYYY-MM-DD"
                        error={assignment.dueDate.trim() === '' || !validateDate(assignment.dueDate)}
                    />

                    {/* Helper text under due date field explaining the format */}
                    <FormHelperText style={{ marginLeft: 10 }}>
                        Due date must be in format YYYY-MM-DD (e.g., 2025-04-30)
                    </FormHelperText>
                </DialogContent>

                {/* Action buttons for Cancel and Save */}
                <DialogActions>
                    <Button color="secondary" onClick={editClose}>Cancel</Button>
                    <Button color="primary" onClick={onSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AssignmentUpdate;
