import React, { useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import commonContext from '../../contexts/common/commonContext';
import medicinesData from '../../data/medicinesData';
import { AiOutlineSearch } from 'react-icons/ai';
import filtersContext from '../../contexts/filters/filterContext';
import useOutsideClose from '../../hooks/useOutsideClose';


const SearchBar = () => {

    const { searchResults, setSearchResults } = useContext(commonContext);
    const { setFilteredProducts } = useContext(filtersContext);
    const [curSearch, setCurSearch] = useState("");

    const searchRef = useRef();

    // closing the SearchBar
    const closeSearch = () => {
        setSearchResults([]);
        setCurSearch("");
    };

    useOutsideClose(searchRef, closeSearch);

    // handling Search
    const handleSearching = (e) => {
        setCurSearch(e.target.value);

        const searchedTerm = e.target.value.toLowerCase().trim();

        const updatedSearchResults = medicinesData.filter(item => item.title.toLowerCase().includes(searchedTerm));

        searchedTerm === '' ? setSearchResults([]) : setSearchResults(updatedSearchResults);
    };


    return (
        <>
            <div id="" className='grid grid-cols-8 mb-4'>
                <div className='col-span-2 max-sm:col-span-0'></div>
                <div className="col-span-4 max-sm:col-span-full w-full" ref={searchRef}>
                    <div className="flex max-sm:mx-2">
                        
                        <input
                            type="search"
                            className="w-full h-[45px] mr-[10px] px-4 align-middle focus:shadow-[0_0_6px_3px_#d4ddf1] bg-transparent focus:bg-white-1 ring-blue-2 ring-1 rounded-[2px] focus:ring-blue-2 focus:ring-2 text-black-2/90"
                            placeholder="Search for product..."
                            onChange={handleSearching}
                            value={curSearch}
                        />
                        <button
                            type="button"
                            className="h-[45px] w-[80px] text-[1.5rem] bg-blue-5 cursor-pointer hover:bg-blue-6 focus:bg-blue-6 disabled:pointer-events-none disabled:opacity-70 flex items-center justify-center rounded-[3px]"
                            disabled={searchResults.length === 0}
                            onClick={() => {
                                setFilteredProducts(searchResults);
                                closeSearch();
                            }}
                        >
                            <AiOutlineSearch />
                        </button>
                    </div>

                    {
                        searchResults.length !== 0 && (
                            <div className="bg-grey-1 bg-opacity-10 grid justify-start gap-4 mt-4 max-h-[300px] overflow-y-auto p-4 border-[2px] border-blue-2 text-black-2/70 ">
                                {
                                    searchResults.map(item => {
                                        const { id, title } = item;
                                        return (
                                            <Link
                                                to={`/all-medicines/medicine-details/${id}`}
                                                onClick={closeSearch}
                                                key={id}
                                            className='hover:text-black-2'>
                                                {title}
                                            </Link>
                                        );
                                    })
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
};

export default SearchBar;