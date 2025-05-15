"use client"

import Image from "next/image"
import {imageHeaderPath, imageHeaderPath2} from "@/lib/api";

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container flex items-center justify-center gap-4 py-6 flex-col sm:flex-row">
                {/* Logo */}
                <Image
                    src={imageHeaderPath2} // 🔁 Change to your logo path
                    alt="Company Logo"
                    width={100}
                    height={100}
                    className="object-contain rounded"
                />

                {/* Company Name */}
                <p className="text-sm text-muted-foreground font-medium">
                    © {new Date().getFullYear()} C R Resort
                </p>
            </div>
        </footer>
    )
}
