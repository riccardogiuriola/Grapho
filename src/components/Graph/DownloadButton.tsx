import { useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { toSvg } from 'html-to-image';
import { Button, Icon } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

function downloadImage(dataUrl: string) {
    const a = document.createElement('a');

    a.setAttribute('download', 'reactflow.svg');
    a.setAttribute('href', dataUrl);
    a.click();
}

function DownloadButton() {
    const { getNodes } = useReactFlow();
    const saveAsImage = () => {
        const imageWidth = 1920;
        const imageHeight = 1080;

        const viewportElement: any = document.querySelector('.react-flow__viewport');
        if (!viewportElement) {
            console.error("Viewport element not found.");
            return;
        }
        console.log(viewportElement)

        const nodesBounds = getRectOfNodes(getNodes());
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.1, 4);

        toSvg(viewportElement, {
            width: imageWidth,
            height: imageHeight,
            style: {
                width: String(imageWidth),
                height: String(imageHeight),
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        }).then(downloadImage);
    };

    return (
        <Button
            p="4"
            borderRadius="md"
            boxShadow="md"
            onClick={saveAsImage}
        >
            <Icon as={DownloadIcon} />
        </Button>
    );
}

export default DownloadButton;