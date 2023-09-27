import { Flex, IconButton, Link } from "@chakra-ui/react";
import {RiTwitterXFill } from 'react-icons/ri'
import {BsTelegram } from 'react-icons/bs'

function Footer() {

    return(
        <Flex ml={5}>
        <Link href="https://twitter.com/Atrofarm17023" mr={5}>
        <IconButton
            icon={<RiTwitterXFill/>}>
        </IconButton>
        </Link>
        <Link href="https://t.me/+xBSQP3AYGXs3OWEx">
        <IconButton
            icon={<BsTelegram/>}>
        </IconButton>
        </Link>

        </Flex>
    )
}

export default Footer;