<template>
    <svg :style="iconSty"
         aria-hidden="true">
        <use :xlink:href="iconName"/>
    </svg>
</template>
<script>
    export default {
        name: 'Icon',
    
        props: {
            type: {
                default: 'sad'
            },
            size: {
                type: [Number, String],
                default: 16
            },
            color: {
                type: String
            }
        },
    
        computed: {
            iconName() {
                return '#' + this.type
            },
            iconSty() {
                return {
                    'font-size': this.size + 'px',
                    'color': this.color
                }
            }
        }
    }
</script>

<style scoped>
    svg {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
        user-select: none;
    }
</style>