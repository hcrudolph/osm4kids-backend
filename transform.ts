var fs = require('fs');
import _ = require('lodash');
import { baseName, pathSep } from "./helpers";

export class TransformJob {
    constructor() {

    }
    clean_geojson_files(transform_dir: string) {
        var base_dir = process.cwd();
        var complete_transform_dir = base_dir + pathSep() + transform_dir;

        fs.readdir(complete_transform_dir, function (err, query_files) {
            if (err) throw err;
            for (var i in query_files) {
               
                /* do not retransform transformed files */
                if (query_files[i].endsWith('.geojson') && !query_files[i].endsWith('_clean.geojson')) {
                    let fileToTransform: string = complete_transform_dir + pathSep() + query_files[i];
                    let target_fileName: string = fileToTransform.replace('.geojson', '_clean.geojson');

                    transform_this_file(fileToTransform, target_fileName);

                }
            }
        });
    }
}


function transform_this_file(input_file: string, output_file: string) {
    console.log('transform_this_file: ' + input_file);
    let retArr: any[] = [];

    var geojson_Obj = _(JSON.parse(fs.readFileSync(input_file))['features'])
    geojson_Obj.forEach(function (element) {
        // Description: if element = 'node' || (center && (relation || way))
        if (element["type"] == "Feature" &&
            (element["properties"]["type"] == 'node') ||
            (element["properties"]["geometry"] == 'center' &&
                (element["properties"]["type"] == 'relation' ||
                    element["properties"]["type"] == 'way'))) {

            retArr.push({
                id: element['id'],
                latitude: element['geometry']['coordinates'][0],
                longitude: element['geometry']['coordinates'][1],
                tags: element['properties']['tags']
            });
        }

    });

    fs.unlink(output_file, (err) => {
        if (err) {
            //throw err;
            console.log('not successfully deleted ' + output_file);
        }
        console.log('successfully deleted ' + output_file);
    });


    fs.writeFile(output_file, JSON.stringify(retArr), (err) => {
        if (err) {
            //throw err;
            console.log('not successfully created ' + output_file);
        }
        console.log('successfully created ' + output_file);

    });


}

