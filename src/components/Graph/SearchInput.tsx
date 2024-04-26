import React, { useState } from 'react';
import { Input, InputGroup, InputLeftElement, Icon, Box } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

function SearchInput(props: any) {
    const { handleSearchSubmit } = props;
    const [searchQuery, setSearchQuery] = useState<string>('');
    let typingTimer: NodeJS.Timeout;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            handleSearchSubmit(value);
        }, 1000);
    };

    const handleSubmit = () => {
        handleSearchSubmit(searchQuery);
    };

    return (
        <Box borderWidth="1px" borderRadius="lg">
            <InputGroup>
                <InputLeftElement
                    pointerEvents="none"
                    children={<Icon as={SearchIcon} color="gray.500" />}
                />
                <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    borderColor="gray.200"
                    _focus={{ borderColor: 'blue.500' }}
                />
            </InputGroup>
        </Box>
    );
}

export default SearchInput;
