import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import './fileList.css';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";
import { FaFileCirclePlus } from "react-icons/fa6";

export default function FileList() {
    const [files, setFiles] = useState([]);
    const [editingFileId, setEditingFileId] = useState(null);
    const [newFileName, setNewFileName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const fileListContainerRef = useRef(null);
    const fileDetailsRef = useRef(null);
    const itemsPerPage = 15;
    const navigate = useNavigate();
    const { buildingId } = useParams();

    const fetchFiles = useCallback(() => {
        axios.get(`/buildings/${buildingId}/files`)
            .then(response => {
                setFiles(response.data);
            })
            .catch(error => {
                console.error('Error fetching files:', error);
            });
    }, [buildingId]);
    
    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    useEffect(() => {
        if (selectedFile) {
            setTimeout(() => {
                if (fileListContainerRef.current) {
                    fileListContainerRef.current.classList.add('expanded');
                }
                if (fileDetailsRef.current) {
                    fileDetailsRef.current.classList.add('visible');
                }
            }, 10);
        } else {
            if (fileListContainerRef.current) {
                fileListContainerRef.current.classList.remove('expanded');
            }
            if (fileDetailsRef.current) {
                fileDetailsRef.current.classList.remove('visible');
            }
        }
    }, [selectedFile]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                fileDetailsRef.current && !fileDetailsRef.current.contains(event.target) &&
                fileListContainerRef.current && !fileListContainerRef.current.contains(event.target)
            ) {
                setSelectedFile(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEditFileName = (file) => {
        setEditingFileId(file.id);
        setNewFileName(file.fileName);
    };

    const handleSaveFileName = async (file, newFileName) => {
        if (!newFileName) {
            alert("파일 이름을 입력하지 않았습니다.");
            return;
        }
        try {
            const url = `/files/${file.id}`;
            await axios.patch(url, { contents: newFileName });
            alert("파일 이름이 성공적으로 수정되었습니다.");
            setEditingFileId(null);
            fetchFiles();
            setSelectedFile((prevFile) => ({ ...prevFile, fileName: newFileName }));
        } catch (error) {
            console.error("파일 이름 수정 중 오류 발생:", error);
            alert("파일 이름 수정 중 오류가 발생했습니다.");
        }
    };

    const handleFileNameClick = (file, event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedFile(file);
    };

    const handleFileSelect = (buildingId, fileId) => {
        navigate(`/buildings/${buildingId}/files/${fileId}/tables`);
    };

    const handleFileDelete = async (fileId) => {
        const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`/files/${fileId}`);
            if (response.status === 200) {
                alert("파일 삭제 성공");
                fetchFiles();
            } else {
                throw new Error('파일 삭제 실패');
            }
        } catch (error) {
            console.error('There was a problem with the axios operation:', error);
            alert("There was an error deleting the file.");
        }
    };

    const handleNextPage = () => {
        if (currentPage * itemsPerPage < filteredFiles().length) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const filteredFiles = () => {
        if (!searchQuery) return files;
        return files.filter(file => file.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        };
        return new Date(dateString).toLocaleString('ko-KR', options);
    };

    const paginatedFiles = filteredFiles().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredFiles().length / itemsPerPage);

    return (
        <div className="file-list-page">
            <div className="file-list-container" ref={fileListContainerRef}>
                <h2>파일 목록</h2>
                <div className='file-list-header'>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="파일 이름으로 검색..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <FaSearch className="search-icon" />
                    </div>
                    <div className='add-container' onClick={() => navigate(`/buildings/${buildingId}/files/upload`, { state: { buildingId } })}>
                        <span>파일 추가</span>
                        <FaFileCirclePlus className='add-file-icon' size={24} />
                    </div>
                </div>
                <div className="file-list-content">
                    <div className="file-list">
                        {files && files.length === 0 ? (
                            <p>현재 DB에 파일이 없습니다.</p>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className='header-cell'>
                                            파일 이름
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedFiles.map((file, index) => (
                                        <tr key={index} onClick={(e) => handleFileNameClick(file, e)} className={selectedFile && selectedFile.id === file.id ? 'selected' : ''}>
                                            <td>
                                                <div className="file-name">
                                                    {file.fileName}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div className="pagination">
                            <GoTriangleLeft onClick={handlePreviousPage} disabled={currentPage === 1} className="pagination-icon" />
                            <span>{currentPage}</span>
                            <GoTriangleRight onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-icon" />
                        </div>
                    </div>
                </div>
            </div>
            <div className={`file-details ${selectedFile ? 'visible' : ''}`} ref={fileDetailsRef}>
                {selectedFile && (
                    <div className='file-detail-container'>
                        <h3>파일 상세 정보</h3>
                        <table className="detail-table">
                            <tbody>
                                <tr>
                                    <td><strong>파일 ID</strong></td>
                                    <td>{selectedFile.id}</td>
                                </tr>
                                <tr>
                                    <td><strong>파일 이름</strong></td>
                                    <td>{selectedFile.fileName}</td>
                                </tr>
                                <tr>
                                    <td><strong>업로드 날짜</strong></td>
                                    <td>{formatDate(selectedFile.createTime)}</td>
                                </tr>
                                <tr>
                                    <td><strong>최종 수정일</strong></td>
                                    <td>{formatDate(selectedFile.updateTime)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="file-action-buttons">
                            <div className="edit-name-wrapper">
                                <div className="edit-name-container">
                                    {editingFileId === selectedFile.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={newFileName}
                                                onChange={(e) => setNewFileName(e.target.value)}
                                            />
                                            <IoIosSave
                                                onClick={() => handleSaveFileName(selectedFile, newFileName)}
                                                className="save-file-button"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <span>파일 이름 수정</span>
                                            <FaEdit
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditFileName(selectedFile);
                                                }}
                                                className="edit-file-button"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="delete-file-container">
                                <span>파일 삭제</span>
                                <button className="trash-icon" onClick={() => handleFileDelete(selectedFile.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                            <button className="table-view-button" onClick={() => handleFileSelect(buildingId, selectedFile.id)}>테이블 목록 보기</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
