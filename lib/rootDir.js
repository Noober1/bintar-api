module.exports = async function rootDir () {
    const { dirname } = require ( 'path' );
    const { constants, promises: { access } } = require ( 'fs' );

    for ( let path of module.paths ) {
        try {
            let prospectivePkgJsonDir = dirname ( path );
            await access ( path, constants.F_OK );
            return prospectivePkgJsonDir;
        } catch ( e ) {}
    }
    
}