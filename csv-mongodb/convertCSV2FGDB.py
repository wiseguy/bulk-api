import arcpy

# Set overwrite option
#arcpy.env.overwriteOutput = True

inputCSV = "outputCSV/formaAll.csv"

inMemoryCSV = arcpy.CreateUniqueName('inMemoryCSV', 'in_memory')

arcpy.CopyRows_management(inputCSV, inMemoryCSV)

arcpy.CreateFileGDB_management("outputFGDB", "FORMA_OUTPUT.gdb")

# Set the local variables
in_Table = inputCSV
x_coords = "LON"
y_coords = "LAT"    
out_Layer = "csv_layer"
saved_Layer = "csv_layer.lyr"

# Set the spatial reference
#spRef = r"Coordinate Systems\Projected Coordinate Systems\Utm\Nad 1983\NAD 1983 UTM Zone 11N.prj"
spRef = r"WGS 1984.prj"

# Make the XY event layer...
arcpy.MakeXYEventLayer_management(inMemoryCSV, x_coords, y_coords, out_Layer, spRef)

# Print the total rows
print arcpy.GetCount_management(out_Layer)

# Save to a layer file
#arcpy.SaveToLayerFile_management(out_Layer, saved_Layer)

#arcpy.MakeFeatureLayer_management(out_Layer, "formaAll.shp")
#c:\Aamir\Projects_JS_Node\csv\test.gdb\
# Make a layer from the feature class
#arcpy.MakeFeatureLayer_management("C:/data/mexico.gdb/cities","cities_lyr")
arcpy.CopyFeatures_management(out_Layer, "outputFGDB/FORMA_OUTPUT.gdb/AllCountries")

arcpy.Delete_management(inMemoryCSV)
#arcpy.Delete_management(in_Table)