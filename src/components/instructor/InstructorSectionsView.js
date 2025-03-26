import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SERVER_URL } from '../../Constants';

// instructor views a list of sections they are teaching
// use the URL /sections?email=dwisneski@csumb.edu&year= &semester=
// the email= will be removed in assignment 7 login security
// The REST api returns a list of SectionDTO objects
// The table of sections contains columns
//   section no, course id, section id, building, room, times and links to assignments and enrollments
// hint:
// <Link to="/enrollments" state={section}>View Enrollments</Link>
// <Link to="/assignments" state={section}>View Assignments</Link>

const InstructorSectionsView = (props) => {

    const location = useLocation();
    const { year, semester } = location.state;

    const [sections, setSections] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSections = async () => {
            if (!year || !semester) {
                setMessage('Year and semester not provided.');
                return;
            }

            const email = 'dwisneski@csumb.edu'; // hardcoded for now
            const url = `${SERVER_URL}/sections?email=${email}&year=${year}&semester=${semester}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch');
                }
                const data = await response.json();
                setSections(data);
                setMessage('');
            } catch (error) {
                console.error('Error fetching sections:', error);
                setMessage('Error retrieving sections');
            }
        };

        fetchSections();
    }, [year, semester]);

    return (
        <>
            <h3>Instructor Sections for {semester} {year}</h3>

            {message && <p>{message}</p>}

            {sections.length > 0 && (
                <table border="1" style={{margin: '1em auto', textAlign: 'left', borderCollapse: 'collapse'}}>
                    <thead>
                    <tr>
                        <th>Year</th>
                        <th>Course ID</th>
                        <th>Title</th>
                        <th>Section ID</th>
                        <th>Building</th>
                        <th>Room</th>
                        <th>Times</th>
                        <th>Assignments</th>
                        <th>Enrollments</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sections.map((section) => (
                        <tr key={section.secNo}>
                            <td>{section.year}</td>
                            <td>{section.courseId}</td>
                            <td>{section.title}</td>
                            <td>{section.secId}</td>
                            <td>{section.building}</td>
                            <td>{section.room}</td>
                            <td>{section.times}</td>
                            <td>
                                <Link to="/assignments" state={section}>View Assignments</Link>
                            </td>
                            <td>
                                <Link to="/enrollments" state={section}>View Enrollments</Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </>
    );
}

export default InstructorSectionsView;
