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


const statusMap = {
    1: 'Suspect',
    2: 'Positive',
    3: 'Negative',
    4: 'Post covid'
}

async function fetchMetadata() {
    return query_res = await fetch(`../api/videos/${urlParams.analysis_id}_${urlParams.area_code}`)
        .then((resp) => resp.json()) // Transform the data into json
        .then((resp) => {
            resp.analysis_status_text = statusMap[resp.analysis_status]
            resp.pixel_density = Math.round(resp.pixel_density*10)/10
            // resp.comment = ""
            // resp.confirmed = false
            return resp
        })
        .catch( error => console.error(error) ); // If there is any error you will catch them here
}




async function fetchCrops() {
    return query_res = await fetch(`../api/videos/${urlParams.analysis_id}_${urlParams.area_code}/crops`)
        .then((resp) => resp.json()) // Transform the data into json
        .catch( error => console.error(error) ); // If there is any error you will catch them here
}

async function postCrop(data) {
    return query_res = await fetch(`../api/videos/${urlParams.analysis_id}_${urlParams.area_code}/crops`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then((resp) => resp.json()) // Transform the data into json
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}

async function deleteCrop(crop_id) {
    return query_res = await fetch(`../api/videos/${urlParams.analysis_id}_${urlParams.area_code}/crops/${crop_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then((resp) => resp.json()) // Transform the data into json
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}



async function postApproval(data) {
    return query_res = await fetch(`../api/videos/${urlParams.analysis_id}_${urlParams.area_code}/approvals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then((resp) => resp.json()) // Transform the data into json
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}

async function fetchApprovals() {
    return query_res = await fetch(`../api/videos/${urlParams.analysis_id}_${urlParams.area_code}/approvals`)
        .then((resp) => resp.json()) // Transform the data into json
        .catch( error => console.error(error) ); // If there is any error you will catch them here
}

async function deleteApproval(approval_id) {
    return query_res = await fetch(`../api/videos/${urlParams.analysis_id}_${urlParams.area_code}/approvals/${approval_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then((resp) => resp.json()) // Transform the data into json
    .catch( error => console.error(error) ); // If there is any error you will catch them here
}

async function fetchRawMetadata() {
    return query_res = await fetch(`/mp4/${urlParams.patient_id}/${urlParams.analysis_id}/${urlParams.area_code}/raw/metadata`)
        .then((resp) => resp.json()) // Transform the data into json
        .catch( error => console.error(error) ); // If there is any error you will catch them here
}

async function fetchMp4Metadata() {
    return query_res = await fetch(`/mp4/${urlParams.patient_id}/${urlParams.analysis_id}/${urlParams.area_code}/mp4/metadata`)
        .then((resp) => resp.json()) // Transform the data into json
        .catch( error => console.error(error) ); // If there is any error you will catch them here
}