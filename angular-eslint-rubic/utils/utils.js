module.exports = {
  isConstructor: name => name === 'constructor',
  isSetter: node => node?.kind === 'set'
}
