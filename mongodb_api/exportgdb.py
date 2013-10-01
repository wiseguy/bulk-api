import arcpy
import sys
# Set overwrite option
#arcpy.env.overwriteOutput = True



inputCSV = sys.argv[1]
random = sys.argv[2]
iso3 = sys.argv[3]

gdbFolder = "FORMA_GDB" + random;
filegdb = "FORMA_OUTPUT"+random+".gdb"
featureclass = "outputFGDB/"+gdbFolder + "/"+ filegdb+"/" + iso3

inMemoryCSV = arcpy.CreateUniqueName('inMemoryCSV', 'in_memory')
#print inputCSV
arcpy.CopyRows_management(inputCSV, inMemoryCSV)

arcpy.CreateFileGDB_management("outputFGDB/"+gdbFolder, filegdb)

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
#print arcpy.GetCount_management(out_Layer)

# Make a layer from the feature class
#arcpy.MakeFeatureLayer_management("C:/data/mexico.gdb/cities","cities_lyr")
arcpy.CopyFeatures_management(out_Layer, featureclass)


# arcpy.Delete_management(inMemoryCSV)





#arcpy.Delete_management(in_Table)