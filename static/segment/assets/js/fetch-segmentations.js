async function fetchSegments() {
    return query_res = await fetch(`../api/segmentations?analysis_id=${urlParams.analysis_id}&area_code=${urlParams.area_code}`)
        .then((resp) => resp.json()) // Transform the data into json
        .catch( error => console.error(error) ); // If there is any error you will catch them here
}

async function postSegmentation(data) {
    return query_res = await fetch(`../api/segmentations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then((resp) => resp.json()) // Transform the data into json
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}

async function deleteSegmentation(segmentation_id) {
    return query_res = await fetch(`../api/segmentations/${segmentation_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then((resp) => resp.json()) // Transform the data into json
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}



async function fetchMetadata() {
    return query_res = await fetch(`../api/videos/${urlParams.analysis_id}_${urlParams.area_code}`)
        .then((resp) => resp.json()) // Transform the data into json
        .catch( error => console.error(error) ); // If there is any error you will catch them here
}