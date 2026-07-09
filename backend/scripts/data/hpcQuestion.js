const { ObjectId } = require('mongodb');

const id = () => new ObjectId();

const hpcQuestions = [
    {
        _id: id(),
        question: 'What does squeue show?',
        options: [
            'Jobs currently known to the scheduler',
            'Available disk space',
            'Loaded software modules',
            'CPU temperature'
        ],
        correctAnswerIndex: 0,
        explanation:
            'squeue shows jobs in the scheduler queue, including jobs that are pending, running, or in other scheduler states.',
        active: true
    },
    {
        _id: id(),
        question: 'What is sinfo commonly used for?',
        options: [
            'Checking Slurm partitions and node states',
            'Viewing shell command history',
            'Copying files between servers',
            'Editing files'
        ],
        correctAnswerIndex: 0,
        explanation:
            'sinfo is commonly used to inspect Slurm partitions, node availability, and node states such as idle, allocated, mixed, or down.',
        active: true
    },
    {
        _id: id(),
        question: 'What command is commonly used to submit a Slurm job script?',
        options: [
            'sbatch',
            'squeue',
            'scancel',
            'sinfo'
        ],
        correctAnswerIndex: 0,
        explanation:
            'sbatch submits a batch job script to Slurm.',
        active: true
    },
    {
        _id: id(),
        question: 'What command is commonly used to view your current Slurm jobs?',
        options: [
            'squeue -u $USER',
            'chmod +x $USER',
            'module load $USER',
            'df -h $USER'
        ],
        correctAnswerIndex: 0,
        explanation:
            'squeue -u $USER shows jobs belonging to the current user.',
        active: true
    },
    {
        _id: id(),
        question: 'What does an array job in Slurm allow you to do?',
        options: [
            'Run many similar tasks using one job submission',
            'Store output in an array file format',
            'Load multiple modules at the same time',
            'Split one CPU core into multiple virtual cores'
        ],
        correctAnswerIndex: 0,
        explanation:
            'A Slurm array job lets you run many similar tasks from one submission, each with its own array task ID.',
        active: true
    },
    {
        _id: id(),
        question: 'What does %j commonly mean in a Slurm output filename?',
        options: [
            'The Slurm job ID',
            'The job name',
            'The username',
            'The node name'
        ],
        correctAnswerIndex: 0,
        explanation:
            'In Slurm output filename patterns, %j is commonly replaced with the job ID.',
        active: true
    },
    {
        _id: id(),
        question: 'What does module list usually show?',
        options: [
            'Software modules currently loaded in your environment',
            'All jobs currently running on the cluster',
            'All files in the current directory',
            'All available Slurm partitions'
        ],
        correctAnswerIndex: 0,
        explanation:
            'module list shows which software modules are currently loaded in your shell environment.',
        active: true
    },
    {
        _id: id(),
        question: 'What does module purge usually do?',
        options: [
            'Removes loaded modules from the current environment',
            'Deletes job output files',
            'Cancels every pending job',
            'Clears disk quota usage'
        ],
        correctAnswerIndex: 0,
        explanation:
            'module purge unloads currently loaded modules, giving you a cleaner environment.',
        active: true
    },
    {
        _id: id(),
        question: 'What does ls -la usually show?',
        options: [
            'A detailed listing of files, including hidden files',
            'Only running Slurm jobs',
            'Only available modules',
            'The current memory usage'
        ],
        correctAnswerIndex: 0,
        explanation:
            'ls -la lists files in long format and includes hidden files that begin with a dot.',
        active: true
    },
    {
        _id: id(),
        question: 'What does grep usually help with?',
        options: [
            'Searching text for matching words or patterns',
            'Submitting a batch job',
            'Changing a file owner',
            'Showing all partitions'
        ],
        correctAnswerIndex: 0,
        explanation:
            'grep searches text for matching words or patterns, which is useful when checking logs.',
        active: true
    },
    {
        _id: id(),
        question: 'What does tail -f usually do?',
        options: [
            'Shows new lines added to a file as they appear',
            'Deletes the end of a file',
            'Shows only hidden files',
            'Follows a Slurm partition'
        ],
        correctAnswerIndex: 0,
        explanation:
            'tail -f follows a file and displays new lines as they are written, which is useful for watching logs.',
        active: true
    },
    {
        _id: id(),
        question: 'What does cp source.txt copy.txt do?',
        options: [
            'Copies source.txt to copy.txt',
            'Moves source.txt into copy.txt',
            'Deletes source.txt after creating copy.txt',
            'Compares the two files'
        ],
        correctAnswerIndex: 0,
        explanation:
            'cp copies files or directories. In this example it creates copy.txt from source.txt.',
        active: true
    },
    {
        _id: id(),
        question: 'What does less file.txt help you do?',
        options: [
            'View a file page by page',
            'Make the file smaller',
            'Delete lines from the file',
            'Submit the file as a job'
        ],
        correctAnswerIndex: 0,
        explanation:
            'less lets you view text files page by page without loading everything into the terminal at once.',
        active: true
    },
    {
        _id: id(),
        question: 'What does df -h help check?',
        options: [
            'Filesystem disk usage in a human-readable format',
            'Loaded software modules',
            'Current job queue',
            'File permissions'
        ],
        correctAnswerIndex: 0,
        explanation:
            'df -h shows filesystem disk usage in human-readable units, which helps identify full or nearly full filesystems.',
        active: true
    },
    {
        _id: id(),
        question: 'In JavaScript, what does === check?',
        options: [
            'Strict equality without type coercion',
            'Assignment of a new value',
            'Greater than or equal comparison',
            'Loose equality with type conversion'
        ],
        correctAnswerIndex: 0,
        explanation:
            '=== checks strict equality. It compares both value and type without converting between types.',
        active: true
    },
    {
        _id: id(),
        question: 'What does JSON.stringify do?',
        options: [
            'Converts a JavaScript value into a JSON string',
            'Converts JSON text into a JavaScript object',
            'Deletes empty JSON fields',
            'Checks if JSON is valid without changing it'
        ],
        correctAnswerIndex: 0,
        explanation:
            'JSON.stringify converts JavaScript values such as objects or arrays into JSON text.',
        active: true
    },
    {
        _id: id(),
        question: 'What does JSON.parse do?',
        options: [
            'Converts JSON text into a JavaScript value',
            'Converts an object into JSON text',
            'Deletes JSON from memory',
            'Uploads JSON to a server'
        ],
        correctAnswerIndex: 0,
        explanation:
            'JSON.parse converts valid JSON text into a JavaScript value such as an object or array.',
        active: true
    },
    {
        _id: id(),
        question: 'In Express, what does res.status(404) usually mean?',
        options: [
            'The requested resource was not found',
            'The request succeeded',
            'The server crashed',
            'The user is not allowed to access the route'
        ],
        correctAnswerIndex: 0,
        explanation:
            'HTTP 404 means Not Found. It is used when the requested resource or route cannot be found.',
        active: true
    },
    {
        _id: id(),
        question: 'In Express, what does res.status(500) usually mean?',
        options: [
            'An internal server error occurred',
            'The client sent no body',
            'The request succeeded',
            'The user cancelled the request'
        ],
        correctAnswerIndex: 0,
        explanation:
            'HTTP 500 means Internal Server Error. It usually means something went wrong on the server.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does .each commonly do?',
        options: [
            'Iterates over each item in a collection',
            'Deletes each item in a collection',
            'Sorts a collection automatically',
            'Converts a collection into a string'
        ],
        correctAnswerIndex: 0,
        explanation:
            '.each loops through each item in a collection such as an array or hash.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does .map usually return?',
        options: [
            'A new array containing the transformed values',
            'The original array unchanged every time',
            'Only the first matching value',
            'A boolean true or false'
        ],
        correctAnswerIndex: 0,
        explanation:
            '.map transforms each item in a collection and returns a new array with the results.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does .select usually return?',
        options: [
            'Items that match the condition',
            'The first item only',
            'The number of items in an array',
            'The original string split into words'
        ],
        correctAnswerIndex: 0,
        explanation:
            '.select returns the items for which the block condition is truthy.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does .include? check?',
        options: [
            'Whether a collection or string contains a value',
            'Whether a method has been defined privately',
            'Whether a file exists on disk',
            'Whether a class has been inherited'
        ],
        correctAnswerIndex: 0,
        explanation:
            '.include? checks whether a value exists inside a collection or string and returns true or false.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does split usually do to a string?',
        options: [
            'Breaks the string into an array of smaller strings',
            'Joins an array into one string',
            'Deletes the string',
            'Converts the string into an integer automatically'
        ],
        correctAnswerIndex: 0,
        explanation:
            'split breaks a string into an array, usually using whitespace or a provided separator.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does join usually do?',
        options: [
            'Combines array elements into one string',
            'Splits a string into an array',
            'Starts a new thread',
            'Connects to a database automatically'
        ],
        correctAnswerIndex: 0,
        explanation:
            'join combines array elements into a single string, optionally using a separator.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does chomp usually remove?',
        options: [
            'A trailing newline from a string',
            'All spaces from a string',
            'The first character from a string',
            'All numbers from a string'
        ],
        correctAnswerIndex: 0,
        explanation:
            'chomp commonly removes a trailing newline from a string, which is useful when reading lines from files.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does File.readlines usually return?',
        options: [
            'An array containing the lines of a file',
            'A single boolean showing whether the file exists',
            'The filename without its extension',
            'The file permissions only'
        ],
        correctAnswerIndex: 0,
        explanation:
            'File.readlines reads a file and returns its lines as an array.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what is a symbol such as :name commonly used for?',
        options: [
            'A lightweight identifier often used as a hash key',
            'A string that automatically changes value',
            'A hidden password field',
            'A special type of integer'
        ],
        correctAnswerIndex: 0,
        explanation:
            'Symbols are lightweight identifiers. They are commonly used as hash keys and method names.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does attr_reader create?',
        options: [
            'Getter methods for instance variables',
            'Setter methods only',
            'A new class automatically',
            'A private constant'
        ],
        correctAnswerIndex: 0,
        explanation:
            'attr_reader creates getter methods so instance variables can be read from outside the object.',
        active: true
    },
    {
        _id: id(),
        question: 'In Ruby, what does a hash store?',
        options: [
            'Key-value pairs',
            'Only ordered numbers',
            'Only one string value',
            'Only method definitions'
        ],
        correctAnswerIndex: 0,
        explanation:
            'A Ruby hash stores key-value pairs, similar to a dictionary or object map in other languages.',
        active: true
    }
];

module.exports = hpcQuestions;