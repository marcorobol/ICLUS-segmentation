/**
 * This variable stores the logged in user
 */
var loggedUser;

/**
 * This function is called when login button is pressed.
 * Note that this does not perform an actual authentication of the user.
 * A student is loaded given the specified email,
 * if it exists, the studentId is used in future calls.
 */
function login()
{
    //get the form object
    var email = document.getElementById("loginEmail").value;
    // console.log(email);

    fetch('../api/v1/students?email=' + email)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        //console.log(data);
        loggedUser = data[0];
        loggedUser.id = loggedUser.self.substring(loggedUser.self.lastIndexOf('/') + 1);
        document.getElementById("loggedUser").innerHTML = loggedUser.email;
        loadLendings();
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here

};


const fields = ["operator_id", "patient_id", "analysis_id", "analysis_status", "rating_operator", "depth", "frequency", "focal_point", "pixel_density"]



/**
 * This function refresh the list
 */
function refresh() {
    
    var queryParams = []
    // queryParams.push("where=depth%20IS%20NOT%20NULL")
    queryParams.push("where=frames%20IS%20NOT%20NULL")
    
    for (field of fields) {
        let value = $('#'+field)[0].options[$('#'+field)[0].selectedIndex].value
        if(value=="null")
            queryParams.push("where="+field+"%20IS%20NULL");
        else if(value!="any")
            queryParams.push("where="+field+"="+value);
    }
    
    let query = '../api/videos?' + queryParams.join("&");
    
    // fetch('../api/videos?where=depth%20IS%20NOT%20NULL')
    fetch(query)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data to modify as you please
        
        // console.log(data[0]);

        // Title
        const videosTitle = document.getElementById('videosTitle');
        videosTitle.innerText = 'Videos: ' + data.length

        // Table
        document.getElementById('videos').children[1].innerHTML=""
        const table = document.getElementById('videos'); // Get the table where we will place our authors
        return data.map(function(video) { // Map through the results and for each run the code below
            
            // let bookId = book.self.substring(book.self.lastIndexOf('/') + 1);
            
            let tr = document.createElement('tr');

            tr.innerHTML += `
                <td>
                    ${video.operator_id}
                </td>

                <td>
                    <a href='../unzipped/${video.patient_id}/'>
                        ${video.patient_id}
                    </a>
                </td>

                <td>
                    <a href='../unzipped/${video.patient_id}/${video.analysis_id}/'>
                        ${video.analysis_id}
                    </a>
                </td>

                <td>
                    <a href='../unzipped/${video.patient_id}/${video.analysis_id}/raw/snapshot_${video.analysis_id}_${video.file_area_code}.png'>
                        png
                    </a>
                    <a href='segment?patient_id=${video.patient_id}&analysis_id=${video.analysis_id}&area_code=${video.file_area_code}'>
                        Segment
                    </a>
                </td>

                <td>
                    ${video.analysis_status}
                </td>

                <td>
                    ${video.rating_operator}
                </td>

                <td>
                    ${(video.depth)}
                    ${(video.depth?`
                        <img src='../unzipped/${video.patient_id}/${video.analysis_id}/raw/snapshot_${video.analysis_id}_${video.file_area_code}_D.png'/>
                    `:'')}
                </td>

                <td>
                    ${(video.frequency)}
                    ${(video.frequency?`
                        <img src='../unzipped/${video.patient_id}/${video.analysis_id}/raw/snapshot_${video.analysis_id}_${video.file_area_code}_F.png'/>
                    `:'')}
                </td>

                <td>
                    ${(video.focal_point)}
                    ${`
                        <img src='../unzipped/${video.patient_id}/${video.analysis_id}/raw/snapshot_${video.analysis_id}_${video.file_area_code}_Fc.png'/>
                    `}
                </td>

                <td>
                    ${(video.pixel_density)}
                </td>

            `;

            // span.innerHTML += `<button type="button" onclick="takeBook('${videos.self}')">Open</button>`
            
            // Append all rows
            table.children[1].appendChild(tr);
        })

    })
    .catch( error => console.error(error) );// If there is any error you will catch them here
    
}
// refresh();





var roundDepthBy="null";
var roundFrequencyBy="null";
var roundPixelDensityBy="null";

async function callStats({groupBy}) {
  
    let queries = []
  
    for (field of groupBy) {
    //   if(field=="depth" || field=="frequency" || field=="pixel_density" || field=="structure" || field=="rating" || field=="structure")
        queries.push('groupBy='+field)
    }
    
    // let roundDepthBy = $('#roundDepthBy')[0].value
    // let roundFrequencyBy = $('#roundFrequencyBy')[0].value
    // let roundPixelDensityBy = $('#roundPixelDensityBy')[0].value
  
    if (roundDepthBy!="null") queries.push('roundDepthBy='+roundDepthBy)
    if (roundFrequencyBy!="null") queries.push('roundFrequencyBy='+roundFrequencyBy)
    if (roundPixelDensityBy!="null") queries.push('roundPixelDensityBy='+roundPixelDensityBy)
  
    return query_res = await fetch('../api/stats?'+queries.join('&'))
      .then((resp) => resp.json()) // Transform the data into json
      .catch( error => console.error(error) ); // If there is any error you will catch them here
}





async function init(field)
{
    var depths = await callStats({groupBy: [field]});
    
    var o = new Option("any", "any", true); //"option text", "value"
    $("#"+field)[0].append(o);

    for (d of depths) {
        var o = new Option(d[field], d[field]); //"option text", "value"
        /// jquerify the DOM object 'o' so we can use the html method
        // $(o).html("option text");
        $("#"+field)[0].append(o);
    }

};
for (field of fields) {
    init(field)
}