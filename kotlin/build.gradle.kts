plugins {
    kotlin("jvm") version "1.9.22"
    application
}

group = "com.gudang.app"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    // PostgreSQL JDBC Driver
    implementation("org.postgresql:postgresql:42.7.2")

    // JUnit 5 Testing Framework (Ekuivalen Jest di Kotlin)
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass.set("kotlin.RunAppKt")
}

tasks.test {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")
    }
}
