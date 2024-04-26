import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Button,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import { DeleteIcon, MoonIcon, RepeatIcon, SunIcon } from '@chakra-ui/icons'
import "./App.css";

import "reactflow/dist/style.css";
import Graph from "./components/Graph";
import InterceptorTable from "./components/InterceptorTable";

interface RequestInfo {
  url: string;
  method: string;
  status: number;
  remoteAddress: string;
  size: number;
  time: string;
  responseData?: JSON;
}

function App(): JSX.Element {
  const [requests, setRequests] = useState<RequestInfo[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const { colorMode, toggleColorMode } = useColorMode();

  const toggleDrawer = (status = !isDrawerOpen) => {
    setIsDrawerOpen(status);
  };

  function reloadPage() {
    chrome.tabs.reload()
  }

  useEffect(() => {
    const listener = (request: chrome.devtools.network.Request) => {
      if (
        request.response &&
        request.response.content &&
        request.response.content.mimeType.includes("json")
      ) {
        const { url, method } = request.request;
        const status = request.response.status;
        const remoteAddress = request.serverIPAddress || "";

        const size = request.response.content.size;
        const time = String(request.time).split(".")[0];

        request.getContent((responseData: string) => {
          const jsonResponseData = JSON.parse(responseData);
          setRequests((prevRequests) => [
            ...prevRequests,
            {
              url,
              method,
              status,
              remoteAddress,
              size,
              time,
              responseData: jsonResponseData
            },
          ]);
        });
      }
    };

    chrome.devtools.network.onRequestFinished.addListener(listener);

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(listener);
    };
  }, []);

  function clearHistory() {
    setIsDrawerOpen(false);
    setSelectedRow(null);
    setRequests([]);
  }

  return (
    <Box>
      <Flex position="fixed" bottom="4" left="4" gap="1">
        <Button
          p="4"
          borderRadius="md"
          boxShadow="md"
          onClick={reloadPage}
        >
          <Icon as={RepeatIcon} />
        </Button>
        <Button
          p="4"
          borderRadius="md"
          boxShadow="md"
          onClick={clearHistory}
        >
          <Icon as={DeleteIcon} />
        </Button>
        <Button
          p="4"
          borderRadius="md"
          boxShadow="md"
          onClick={toggleColorMode}
        >
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>
      <Flex>
        <InterceptorTable requests={requests} selectedRow={selectedRow} setSelectedRow={setSelectedRow} toggleDrawer={toggleDrawer} />
        {isDrawerOpen && (
          <Graph toggleDrawer={toggleDrawer} requests={requests} selectedRow={selectedRow} />
        )}
      </Flex>
    </Box>
  );
}



export default App;
