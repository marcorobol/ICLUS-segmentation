
module.exports = ({patient,analysis,video}) => `
<tr>
    <td>
        <a href='../unzipped/${patient.patientId}/${analysis.analysisId}/raw/snapshot_${analysis.analysisId}_${video.areaCode}.png'>
            ${video.areaCode}
        </a>
    </td>
    <td>
        ${video.status?video.status+':'+video.statusMessage:''}
    </td>
    <td>
        ${video.rating_operator?video.rating_operator:'notRated'}
    </td>
    <td>
        ${(video.profileLabel?video.profileLabel:'')}
    </td>

    <td>
        ${(video.depth?video.depth.value:'unknownDepth')}
        ${(video.depth?`
            <img src='../unzipped/${patient.patientId}/${analysis.analysisId}/raw/snapshot_${analysis.analysisId}_${video.areaCode}_D.png'/>
        `:'')}
    </td>
    <td>
        ${(video.frequency&&video.frequency.value?video.frequency.value:'unknownFrequency')}
        ${(video.frequency&&video.frequency.value?`
            <img src='../unzipped/${patient.patientId}/${analysis.analysisId}/raw/snapshot_${analysis.analysisId}_${video.areaCode}_F.png'/>
        `:'')}
    </td>
    <td>
        ${(video.resolution?Math.round(video.resolution*100)/100:'unknownResolution')}
    </td>
    <td>
        ${(video.focalPoint&&video.focalPoint.value?video.focalPoint.value:'unknownFocalPoint')}
        ${(video.focalPoint&&video.focalPoint.value?`
            <img src='../unzipped/${patient.patientId}/${analysis.analysisId}/raw/snapshot_${analysis.analysisId}_${video.areaCode}_Fc.png'/>
        `:'')}
    </td>

    <td>
        ${(video.error?video.error:'')}
    </td>
    
</tr>
`;


