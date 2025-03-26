import React, {useState, useEffect} from 'react';
import {SERVER_URL} from "../../Constants";
import Button from "@mui/material/Button";

// students gets a list of all courses taken and grades
// use the URL /transcripts?studentId=
// the REST api returns a list of EnrollmentDTO objects 
// the table should have columns for 
//  Year, Semester, CourseId, SectionId, Title, Credits, Grade

const Transcript = (props) => {
    const headers =
        ['Year', 'Semester',  'CourseId', 'SectionId', 'Title', 'Credits', 'Grade'];
    const [transcripts, setTranscripts] = useState([]);
    const [search, setSearch] = useState({studentId: 3});
    const [message, setMessage] = useState('');

    // http://localhost:8080/transcripts?studentId=3
    // returns
    // {
    //     "enrollmentId": 1, "grade": "A", "studentId": 3, "name": "thomas edison", "email": "tedison@csumb.edu",
    //     "courseId": "cst338", "title": "Software Design", "sectionId": 1, "sectionNo": 1, "building": "052",
    //     "room": "100", "times": "M W 10:00-11:50", "credits": 4, "year": 2024, "semester": "Fall"
    // }

    const fetchTranscript = async () => {
        if (search.studentId==='') {
            setMessage("Enter search parameters");
        } else {
            try {
                const response = await fetch(`${SERVER_URL}/transcripts?studentId=${search.studentId}`);
                if (response.ok) {
                    const data = await response.json();
                    setTranscripts(data);
                } else {
                    const rc = await response.json();
                    setMessage(rc.message);
                }
            } catch(err) {
                setMessage("network error: "+err);
            }
        }
    }

    const editChange = (event) => {
        setSearch({...search,  [event.target.name]:event.target.value});
    }

    useEffect(() =>{
        fetchTranscript()
    }, []);

    return(
        <div>
            <h3>Enrollments</h3>
            <h4>{message}</h4>
            {/*<h4>Enter studentId.  Example  3</h4>*/}
            {/*<table className="Center">*/}
            {/*    <tbody>*/}
            {/*    <tr>*/}
            {/*        <td>StudentId: </td>*/}
            {/*        <td><input type="text" id="sstudentId" name="studentId" value={search.studentId} onChange={editChange} /></td>*/}
            {/*    </tr>*/}
            {/*    </tbody>*/}
            {/*</table>*/}
            {/*<br/>*/}
            {/*<button id="search" type="submit" onClick={fetchTranscript} >View Transcript</button>*/}
            {/*<br/>*/}
            <br/>
            <table className="Center" >
                <thead>
                <tr>
                    {headers.map((s, idx) => (<th key={idx}>{s}</th>))}
                </tr>
                </thead>
                <tbody>
                {transcripts.map((t) => (
                    <tr key={t.enrollemntId}>
                        <td>{t.year}</td>
                        <td>{t.semester}</td>
                        <td>{t.courseId}</td>
                        <td>{t.sectionId}</td>
                        <td>{t.title}</td>
                        <td>{t.credits}</td>
                        <td>{t.grade}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Transcript;
