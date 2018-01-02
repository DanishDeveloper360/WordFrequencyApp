
## Running
    1. Goto sever folder 
    2. npm install
    3. npm start
    4. Use this url and upload a text file, it would return the output : 
        
        http://localhost:8081/processFileUpload


Solution summary :

Underlying concept used : Map Reduce

The node.js app does the following tasks :

1. Split large txt file into smaller ones
2. Map each (splitted) file into Map files i.e. files having count of each word in a splitted file (This process is handled by api and is async in nature, hence all files are processed parallely)
3. Reduce all the splitted Map files into one Reduced file having all the required word frequency counts including the Prime number logic

Scalability is the key in this design. 

Diagram :

##                  Large FILE              ##
                     Upload API 
                        |
                        | Split
                       \/
    # Split File1 | # Split File2 | # Split File3 | # Split File4       // Split Files API
    # Map File1   | # Map File2   | # Map File3   | # Map File4         // Map Logic API 
                        |    
                        | Reduce                                        // Reduce Logic API
                       \/
                    Output File

## License

MIT
