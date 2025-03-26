import React, {useState} from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Button from '@mui/material/Button';
import {SERVER_URL} from '../../Constants';
import {Alert} from "@mui/material";

// student can view schedule of sections 
// use the URL /enrollments?studentId=3&year= &semester=
// The REST api returns a list of EnrollmentDTO objects
// studentId=3 will be removed in assignment 7

// to drop a course 
// issue a DELETE with URL /enrollments/{enrollmentId}

const ScheduleView = (props) => {
    const headers =
        ['Grade', 'StudentId',  'Name', 'Email', 'CourseId', 'Title',
        'Building', 'Room', 'Times', 'Credits', 'Year', 'Semester', ''];

    const [enrollments, setEnrollments] = useState([]);
    const [search, setSearch] = useState({studentId: 3, year:'', semester:''});
    const [message, setMessage] = useState('');

    // http://localhost:8080/enrollments?studentId=3&year=2025&semester=Spring
    // returns
    // {
    //     "enrollmentId": 2, "grade": "B", "studentId": 3, "name": "thomas edison", "email": "tedison@csumb.edu",
    //     "courseId": "cst363", "title": "Introduction to Database", "sectionId": 1, "sectionNo": 8, "building": "052",
    //     "room": "104", "times": "M W 10:00-11:50", "credits": 4, "year": 2025, "semester": "Spring"
    // }
    // const [enrollment, setEnrollment] = useState(
    //     {enrollmentId:'', grade:'', studentId:'', name:'', email:'', courseId:'', title:'', sectionId:'',
    //         sectionNo:'',  building:'', room:'', times:'', credits:'', year:'', semester:''}
    // );
    const fetchEnrollments = async () => {
        if (search.studentId==='' | search.year==='' || search.semester==='' ) {
            setMessage("Enter search parameters");
        } else {
            try {
                const response = await fetch(`${SERVER_URL}/enrollments?studentId=${search.studentId}&year=${search.year}&semester=${search.semester}`);
                if (response.ok) {
                    const data = await response.json();
                    setEnrollments(data);
                } else {
                    const rc = await response.json();
                    setMessage(rc.message);
                }
            } catch(err) {
                setMessage("network error: "+err);
            }
        }
    }

    const deleteEnrollment = async (enrollmentId) => {
        try {
            const response = await fetch (`${SERVER_URL}/enrollments/${enrollmentId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            if (response.ok) {
                setMessage("Enrollment deleted");
                await fetchEnrollments();
            } else {
                const rc = await response.json();
                setMessage(rc.message);
            }
        } catch (err) {
            setMessage("network error: "+err);
        }
    }

    const editChange = (event) => {
        setSearch({...search,  [event.target.name]:event.target.value});
    }

    const onDelete = (e) => {
        const row_idx = e.target.parentNode.parentNode.rowIndex - 1
        // console.log(row_idx);
        // alert(row_idx);
        const enrollmentId = enrollments[row_idx].enrollmentId //.enrollmentId;
        // alert(enrollmentId);
        confirmAlert({
            title: 'Confirm to delete',
            message: 'Do you really want to delete?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => deleteEnrollment(enrollmentId)
                },
                {
                    label: 'No',
                }
            ]
        });
    }

    return(
        <div>
            <h3>Enrollments</h3>
            <h4>{message}</h4>
            <h4>Enter year, semester.  Example  2025 Spring</h4>
            <table className="Center">
                <tbody>
                {/*<tr>*/}
                {/*    <td>StudentId: </td>*/}
                {/*    <td><input type="text" id="sstudentId" name="studentId" value={search.studentId} onChange={editChange} /></td>*/}
                {/*</tr>*/}
                <tr>
                    <td>Year:</td>
                    <td><input type="text" id="syear" name="year" value={search.year} onChange={editChange} /></td>
                </tr>
                <tr>
                    <td>Semester:</td>
                    <td><input type="text" id="ssemester" name="semester" value={search.semester} onChange={editChange} /></td>
                </tr>
                </tbody>
            </table>
            <br/>
            <button id="search" type="submit" onClick={fetchEnrollments} >Search for Enrollments</button>
            <br/>
            <br/>
            <table className="Center" >
                <thead>
                <tr>
                    {headers.map((s, idx) => (<th key={idx}>{s}</th>))}
                </tr>
                </thead>
                <tbody>
                    {enrollments.map((e) => (
                        <tr key={e.enrollemntId}>
                            <td>{e.grade}</td>
                            <td>{e.studentId}</td>
                            <td>{e.name}</td>
                            <td>{e.email}</td>
                            <td>{e.courseId}</td>
                            <td>{e.title}</td>
                            {/*<td>{e.secId}</td>*/}
                            {/*<td>{e.secNo}</td>*/}
                            <td>{e.building}</td>
                            <td>{e.room}</td>
                            <td>{e.times}</td>
                            <td>{e.credits}</td>
                            <td>{e.year}</td>
                            <td>{e.semester}</td>
                            {/*<td><SectionUpdate section={s} onClose={fetchSections} /></td>*/}
                            <td><Button onClick={onDelete}>Delete</Button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ScheduleView;
