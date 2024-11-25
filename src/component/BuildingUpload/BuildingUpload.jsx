import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa'; // Import the search icon
import './BuildingUpload.css';
import DaumPostcodeModal from './DaumPostcodeModal.jsx';

const BuildingUpload = () => {
    const [formData, setFormData] = useState({
        buildingName: '',
        address: '',
        totalArea: '',
        groundFloors: '',
        basementFloors: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if ((name === 'groundFloors' || name === 'basementFloors') && value < 0) {
            alert('음수는 입력할 수 없습니다.');
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddressComplete = (address) => {
        setFormData({
            ...formData,
            address: address
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const buildingNameInput = document.querySelector('input[name="buildingName"]');
        const addressInput = document.querySelector('input[name="address"]');

        if (!formData.buildingName.trim()) {
            buildingNameInput.setCustomValidity('이 입력란을 작성하세요');
            buildingNameInput.reportValidity();
            return;
        } else {
            buildingNameInput.setCustomValidity('');
        }

        if (!formData.address.trim()) {
            addressInput.setCustomValidity('이 입력란을 작성하세요');
            addressInput.reportValidity();
            return;
        } else {
            addressInput.setCustomValidity('');
        }

        try {
            await axios.post('/buildings', formData);
            navigate('/buildings');
        } catch (error) {
            console.error('There was an error submitting the form!', error.response.data); // 에러 응답 데이터 출력
        }
    };

    return (
        <div className='main-container'>
            <form className='form-container' onSubmit={handleSubmit}>
                <div>
                    <label>*건물명</label>
                    <input
                        type="text"
                        name="buildingName"
                        value={formData.buildingName}
                        onChange={handleChange}
                        onInvalid={(e) => e.target.setCustomValidity('이 입력란을 작성하세요')}
                        onInput={(e) => e.target.setCustomValidity('')}
                        required
                    />
                </div>
                <div className="address-search">
                    <label>*건물주소</label>
                    <div className="address-input-container">
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            onInvalid={(e) => e.target.setCustomValidity('이 입력란을 작성하세요')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            required
                        />
                        <button type="button" className="search-button" onClick={() => setIsModalOpen(true)}>
                            <FaSearch />
                        </button>
                    </div>
                </div>
                <div>
                    <label>총면적(㎡)</label>
                    <input
                        type="text"
                        name="totalArea"
                        value={formData.totalArea}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>지상 층수</label>
                    <input
                        type="number"
                        name="groundFloors"
                        min="0"
                        value={formData.groundFloors}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>지하 층수</label>
                    <input
                        type="number"
                        name="basementFloors"
                        min="0"
                        value={formData.basementFloors}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">업로드</button>
            </form>
            {isModalOpen && (
                <DaumPostcodeModal
                    onComplete={handleAddressComplete}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default BuildingUpload;
