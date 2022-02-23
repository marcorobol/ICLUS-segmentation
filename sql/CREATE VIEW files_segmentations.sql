DROP VIEW files_segmentations;

CREATE VIEW files_segmentations AS

SELECT * FROM (

SELECT file.*,
	segmentations_count,
	segmentations_ids,
	crops_count
FROM

app_file_flat AS file

LEFT JOIN

(
SELECT segmentations.analysis_id,
	segmentations.area_code,
	COUNT (segmentations.segmentation_id) AS segmentations_count,
	ARRAY_AGG (segmentations.segmentation_id) AS segmentations_ids
FROM segmentations
GROUP BY segmentations.analysis_id, segmentations.area_code
) AS seg

ON CONCAT(file.analysis_id,file.file_area_code) = CONCAT(seg.analysis_id,seg.area_code)

LEFT JOIN

(
SELECT crops.analysis_id,
	crops.area_code,
	COUNT (crops.crop_id) AS crops_count
FROM crops
GROUP BY crops.analysis_id, crops.area_code
) AS cr

ON CONCAT(file.analysis_id,file.file_area_code) = CONCAT(cr.analysis_id,cr.area_code)

) AS files_segmentations;