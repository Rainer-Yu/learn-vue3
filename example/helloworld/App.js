export const App = {
    setup() {
        return {
            msg: 'mini-vue'
        }
    },
    render() {
        return h('div', `hi,${this.msg}`)
    }
}
