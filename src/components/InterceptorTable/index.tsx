import { Box, Table, Tbody, Td, Th, Thead, Tr, useColorModeValue } from "@chakra-ui/react";
import { Key } from "react";

export default function InterceptorTable(props: { requests: any; selectedRow: any; setSelectedRow: any; toggleDrawer: any; }) {

    const { requests, selectedRow, setSelectedRow, toggleDrawer } = props;

    const parseURL = (url: string) => {
        const parsedUrl = new URL(url);
        return {
            domain: parsedUrl.protocol + '//' + parsedUrl.hostname,
            path: parsedUrl.pathname
        };
    };

    const hoverBgColor = useColorModeValue("gray.100", "gray.700");

    const selectedRowBgColor = useColorModeValue("blue.100", "blue.700");

    const textColor = useColorModeValue("black", "white");

    return (
        <Box flex="1" maxHeight="100vh" overflowY="auto">
            {/* Table to display request information */}
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Domain</Th>
                        <Th>Path</Th>
                        <Th>Method</Th>
                        <Th>Status Code</Th>
                        <Th>Remote Address</Th>
                        <Th>Size</Th>
                        <Th>Time</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {requests.map((request: { url: string; method: string; status: string; remoteAddress: string; size: string; time: string; }, index: Key | null | undefined) => {
                        const { domain, path } = parseURL(request.url);
                        return (
                            <Tr
                                key={index}
                                onClick={() => {
                                    setSelectedRow(index);
                                    toggleDrawer(true);
                                }}
                                bg={selectedRow === index ? selectedRowBgColor : undefined}
                                _hover={{
                                    bg: selectedRow !== index ? hoverBgColor : undefined,
                                }}
                            >
                                <Td color={textColor}>{domain}</Td>
                                <Td color={textColor}>{path}</Td>
                                <Td color={textColor}>{request.method}</Td>
                                <Td color={textColor}>{request.status}</Td>
                                <Td color={textColor}>{request.remoteAddress}</Td>
                                <Td color={textColor}>{request.size}</Td>
                                <Td color={textColor}>{request.time} ms</Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </Box>
    )
}
