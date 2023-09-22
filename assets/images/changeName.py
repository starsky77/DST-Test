import os

def rename_files_in_folder(folder_path):
    # List all files in the directory
    filenames = os.listdir(folder_path)
    
    # Shuffle the filenames to change their order
    # import random
    # random.shuffle(filenames)
    
    # Counter for the new filenames
    counter = 1
    
    for filename in filenames:
        # Get file extension
        file_extension = os.path.splitext(filename)[1]
        
        # Construct new filename
        new_filename = f"{counter}{file_extension}"
        
        # Full path to the original and new files
        original_file = os.path.join(folder_path, filename)
        new_file = os.path.join(folder_path, new_filename)
        
        # Rename the file
        os.rename(original_file, new_file)
        
        # Increment the counter
        counter += 1
# Specify the folder path where your images are stored
folder_path = "C:/Users/39968/Documents/GitHub/Distorted-Shape-Test/assets/images/catch_trial/original"

# Call the function
rename_files_in_folder(folder_path)
