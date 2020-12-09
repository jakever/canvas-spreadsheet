<template>
    <div :class="s.wrapper">
        <div @click="prev" :class="{[s.active]: currentPage === 1, [s.smallPager]: true}">
            <Icon type="arrow-back"></Icon>
        </div>
        <span :class="[s.smallPager, s.currentPage]">{{currentPage}}</span>
        <div @click="next" :class="{[s.active]: currentPage === totalPage, [s.smallPager]: true}">
            <Icon type="arrow-forward"></Icon>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        currentPage: {
            type: Number,
            default: 1
        },
        totalPage: {
            type: Number,
            default: 0
        },
        next: {
            type: Function,
            default: () => { }
        },
        prev: {
            type: Function,
            default: () => { }
        }
    }
}
</script>
<style module="s" lang="scss">
.wrapper {
    display: flex;
}

.smallPager {
    vertical-align: top;
    display: inline-block;
    font-size: 13px;
    height: 28px;
    line-height: 28px;
    cursor: pointer;
    box-sizing: border-box;
    text-align: center;
    font-weight: 700;
    background-color: #fff;
    min-width: 30px;
    border: 1px solid #e1e6eb;
    user-select: none;

    svg {
        color: #80848f;
        font-size: 12px;
    }
}

.active {
    cursor: not-allowed;

    svg {
        color: #e1e6eb;
    }
}

.currentPage {
    color: #495060;
    font-weight: 400;
    font-size: 12px;
    cursor: auto;
    border-left: none;
    border-right: none;
}
</style>