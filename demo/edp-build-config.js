exports.input = __dirname;

var path = require( 'path' );
exports.output = path.resolve( __dirname, 'output' );

// var moduleEntries = 'html,htm,phtml,tpl,vm,js';
var pageFiles = [
    '*.html',
    '*.htm',
    '*.phtml',
    '*.tpl',
    '*.vm',
    '*.tpl.js',
    '*.etpl.js'
];

exports.getProcessors = function () {
    var lessProcessor = new LessCompiler();
    var cssProcessor = new CssCompressor();
    var moduleProcessor = new ModuleCompiler();
    var jsProcessor = new JsCompressor();
    var pathMapperProcessor = new PathMapper();
    var addCopyright = new AddCopyright();

    var requireLessProcessor = {
        name: 'RequireLessProcessor',

        files: [
            'src/**/*.js'
        ],

        /**
         * 构建处理
         *
         * @param {Object} file 文件信息对象
         * @param {Object} context 构建环境对象
         * @param {Function} callback 处理完成回调函数
         */
        process: function (file, context, callback) {
            file.data = file.data.replace(/\.less\b/g, '.css');
            callback();
        }
    };

    return {
        'default': [ lessProcessor, moduleProcessor, requireLessProcessor, pathMapperProcessor ],
        'release': [
            lessProcessor, cssProcessor, moduleProcessor, requireLessProcessor,
            jsProcessor, pathMapperProcessor, addCopyright
        ]
    };
};

exports.exclude = [
    'tool',
    'doc',
    'test',
    'module.conf',
    'dep/packages.manifest',
    'dep/*/*/test',
    'dep/*/*/doc',
    'dep/*/*/demo',
    'dep/*/*/tool',
    'dep/*/*/*.md',
    'dep/*/*/package.json',
    'edp-*',
    '.edpproj',
    '.svn',
    '.git',
    '.gitignore',
    '.idea',
    '.project',
    'Desktop.ini',
    'Thumbs.db',
    '.DS_Store',
    '*.tmp',
    '*.bak',
    '*.swp'
];

exports.injectProcessor = function ( processors ) {
    for ( var key in processors ) {
        global[ key ] = processors[ key ];
    }
};

