import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TextField, Button, DialogActions, DialogContent } from '@mui/material';
import { SERVER_URL } from '../../Constants';
import Dialog from "@mui/material/Dialog";

// instructor enters students' grades for an assignment
// fetch the grades using the URL /assignments/{id}/grades
// REST api returns a list of GradeDTO objects
// display the list as a table with columns 'gradeId', 'student name', 'student email', 'score'
// score column is an input field

const AssignmentGrade = (props) => {
    const location = useLocation();
    // const { assignmentId } = location.state;

    const assignmentId = props.assignment?.id || location.state?.assignmentId;

    const [open, setOpen] = useState(false);
    const [editMessage, setEditMessage] = useState('');
    const [gradeData, setGradeData] = useState({
        assignmentTitle: '',
        courseId: '',
        sectionNo: '',
        grades: []
    });

    const editOpen = () => {
        setOpen(true);
        fetchGrades();
    }

    const fetchGrades = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/assignments/${assignmentId}/grades`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setGradeData({
                        assignmentTitle: data[0].assignmentTitle,
                        courseId: data[0].courseId,
                        sectionNo: data[0].sectionNo,
                        grades: data
                    });
                }
            } else {
                const error = await response.json();
                setEditMessage(error.message);
            }
        } catch (err) {
            setEditMessage("Network error: " + err);
        }
    };

    const onChange = (event, index) => {
        const updatedGrades = [...gradeData.grades];
        updatedGrades[index].score = event.target.value;
        setGradeData({ ...gradeData, grades: updatedGrades });
    };

    const onSave = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/grades`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gradeData.grades)
            });
            if (response.ok) {
                setEditMessage("Grades successfully saved.");
            } else {
                const error = await response.json();
                setEditMessage(error.message);
            }
        } catch (err) {
            setEditMessage("Network error: " + err);
        }
    };

    const editClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button variant="outlined" onClick={editOpen}>Grade</Button>
            <Dialog open = {open}>
                <DialogContent style={{ paddingTop: 20 }}>
                    <h3>Enter Grades for Assignment: {gradeData.assignmentTitle}</h3>
                    <h4>Course: {gradeData.courseId} | Section: {gradeData.sectionNo}</h4>
                    <h4 style={{ color: 'red' }}>{editMessage}</h4>
                    <table className="Center">
                        <thead>
                        <tr>
                            <th>Grade ID</th>
                            <th>Student Name</th>
                            <th>Student Email</th>
                            <th>Score (0-100)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gradeData.grades.map((g, index) => (
                            <tr key={g.gradeId}>
                                <td>{g.gradeId}</td>
                                <td>{g.studentName}</td>
                                <td>{g.studentEmail}</td>
                                <td>
                                    <TextField
                                        type="number"
                                        name="score"
                                        value={g.score ?? ''}
                                        onChange={(e) => onChange(e, index)}
                                        inputProps={{ min: 0, max: 100 }}
                                        size="small"
                                        style={{ padding: 10 }}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={editClose}>Close</Button>
                    <Button color="primary" onClick={onSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AssignmentGrade;
